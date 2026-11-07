/**
 * fetch() for the agent service, tolerant of it waking from sleep.
 *
 * On Railway the agent sleeps when idle, and the request that wakes it can
 * fail while the container boots (chromadb + langgraph imports take ~8-15s).
 * Without a retry, the first visitor after a quiet spell gets an error.
 *
 * Only failures that mean "the agent never handled this" are retried:
 * connection errors and gateway statuses. Any other status is a real answer
 * from the agent and goes back to the caller. That matters because each
 * generation that does run spends OpenAI and Tavily money.
 */

const RETRYABLE_STATUSES = new Set([502, 503, 504]);

// 23s of waiting in total, comfortably past the agent's cold start.
const WAKE_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 8000];

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

async function fetchWithWakeRetry(url, options = {}, delaysMs = WAKE_RETRY_DELAYS_MS) {
  for (let attempt = 0; ; attempt++) {
    const hasRetryLeft = attempt < delaysMs.length;
    let failure;

    try {
      const response = await fetch(url, options);
      if (!RETRYABLE_STATUSES.has(response.status) || !hasRetryLeft) {
        return response;
      }
      failure = `status ${response.status}`;
      await response.body?.cancel();
    } catch (error) {
      if (error.name === "AbortError" || !hasRetryLeft) throw error;
      failure = error.cause?.code || error.message;
    }

    console.warn(
      `AI service not ready (${failure}), retry ${attempt + 1}/${delaysMs.length} in ${delaysMs[attempt]}ms`
    );
    await sleep(delaysMs[attempt], options.signal);
  }
}

module.exports = { fetchWithWakeRetry };
