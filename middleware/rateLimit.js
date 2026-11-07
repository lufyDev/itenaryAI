/**
 * Dependency-free sliding-window rate limiter.
 *
 * Exists for one reason: /generate-stream spends real OpenAI and Tavily
 * money on every call. Without a cap, one bored visitor (or a crawler that
 * got hold of a token) can run up the bill.
 *
 * Caveat: the counters live in process memory, so on a scale-to-zero host
 * each container instance keeps its own tally and the effective limit is
 * (limit x instances). That is fine at demo traffic — keep max-instances
 * low on the platform side. Move to Redis/Mongo if this ever gets real use.
 */

const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** @type {Map<string, number[]>} key -> timestamps of recent hits */
const hits = new Map();

function prune(timestamps, now) {
  const cutoff = now - WINDOW_MS;
  let i = 0;
  while (i < timestamps.length && timestamps[i] <= cutoff) i += 1;
  return i === 0 ? timestamps : timestamps.slice(i);
}

/**
 * @param {object} opts
 * @param {number} opts.perUser  max requests per authenticated user per window
 * @param {number} opts.global   max requests across everyone per window
 */
function rateLimit({ perUser = 3, global: globalLimit = 20 } = {}) {
  return function rateLimitMiddleware(req, res, next) {
    const now = Date.now();

    // authRequired runs before this, so req.user is normally set. The IP
    // fallback keeps the limiter honest if it is ever mounted unauthenticated.
    const userKey = req.user?.userId
      ? `user:${req.user.userId}`
      : `ip:${req.ip}`;

    for (const [key, limit] of [
      [userKey, perUser],
      ["global", globalLimit],
    ]) {
      const timestamps = prune(hits.get(key) || [], now);
      hits.set(key, timestamps);

      if (timestamps.length >= limit) {
        const retryAfterMs = timestamps[0] + WINDOW_MS - now;
        const retryAfter = Math.max(1, Math.ceil(retryAfterMs / 1000));
        res.set("Retry-After", String(retryAfter));
        return res.status(429).json({
          message:
            key === "global"
              ? "This demo is at its hourly generation limit. Try again later, or view the sample itinerary."
              : "You have hit the hourly generation limit for this demo.",
          retryAfterSeconds: retryAfter,
        });
      }
    }

    // Only record the hit once both checks pass, so a rejected request
    // does not count against the caller.
    for (const key of [userKey, "global"]) {
      hits.get(key).push(now);
    }

    next();
  };
}

module.exports = { rateLimit };
