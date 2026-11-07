const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { fetchWithWakeRetry } = require("../services/aiServiceClient");

const FAST_DELAYS = [5, 5, 5];

// A real local server, so these exercise fetch's actual failure modes.
function startServer(statuses, port = 0) {
  const requests = [];
  const server = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      requests.push(body);
      const status = statuses[Math.min(requests.length - 1, statuses.length - 1)];
      res.writeHead(status);
      res.end(`status ${status}`);
    });
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      resolve({
        requests,
        port: server.address().port,
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

const post = { method: "POST", body: "payload" };

test.beforeEach(() => mock.method(console, "warn", () => {}));
test.afterEach(() => mock.restoreAll());

test("returns straight away when the agent is up", async () => {
  const agent = await startServer([200]);
  const res = await fetchWithWakeRetry(agent.url, post, FAST_DELAYS);
  assert.equal(res.status, 200);
  assert.equal(agent.requests.length, 1);
  await agent.close();
});

test("retries gateway errors and resends the body", async () => {
  const agent = await startServer([502, 503, 200]);
  const res = await fetchWithWakeRetry(agent.url, post, FAST_DELAYS);
  assert.equal(res.status, 200);
  assert.deepEqual(agent.requests, ["payload", "payload", "payload"]);
  await agent.close();
});

test("retries a refused connection until the agent comes up", async () => {
  const placeholder = await startServer([200]);
  const { port } = placeholder;
  await placeholder.close();

  const agentStarting = new Promise((resolve) => {
    setTimeout(() => resolve(startServer([200], port)), 50);
  });
  const res = await fetchWithWakeRetry(`http://127.0.0.1:${port}/`, post, [100, 100, 100]);
  assert.equal(res.status, 200);
  await (await agentStarting).close();
});

test("does not retry a real error from the agent", async () => {
  for (const status of [500, 422]) {
    const agent = await startServer([status]);
    const res = await fetchWithWakeRetry(agent.url, post, FAST_DELAYS);
    assert.equal(res.status, status);
    assert.equal(agent.requests.length, 1);
    await agent.close();
  }
});

test("hands back the last gateway error once retries run out", async () => {
  const agent = await startServer([502]);
  const res = await fetchWithWakeRetry(agent.url, post, FAST_DELAYS);
  assert.equal(res.status, 502);
  assert.equal(agent.requests.length, FAST_DELAYS.length + 1);
  await agent.close();
});

test("throws the connection error once retries run out", async () => {
  const placeholder = await startServer([200]);
  const { url } = placeholder;
  await placeholder.close();
  await assert.rejects(fetchWithWakeRetry(url, post, FAST_DELAYS), /fetch failed/);
});

test("stops waiting as soon as the request is aborted", async () => {
  const agent = await startServer([502]);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 50);

  const startedAt = Date.now();
  await assert.rejects(
    fetchWithWakeRetry(agent.url, { ...post, signal: controller.signal }, [60_000]),
    { name: "AbortError" }
  );
  assert.ok(Date.now() - startedAt < 5_000);
  assert.equal(agent.requests.length, 1);
  await agent.close();
});
