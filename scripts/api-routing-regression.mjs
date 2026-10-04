import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import { createServer, preview } from "vite";

// Exercise the real Vite route. The upstream is isolated; no event accounts are changed.
const received = [];
const upstream = createHttpServer(async (request, response) => {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  received.push({ url: request.url, method: request.method, body: raw, authorization: request.headers.authorization });
  response.writeHead(400, { "content-type": "application/json" });
  response.end(JSON.stringify({ error: "Unknown action" }));
});
await new Promise(resolve => upstream.listen(0, "127.0.0.1", resolve));
const previousTarget = process.env.API_PROXY_TARGET;
process.env.API_PROXY_TARGET = `http://127.0.0.1:${upstream.address().port}`;
let development;
let production;
try {
  development = await createServer({ server: { host: "127.0.0.1", port: 0 }, logLevel: "silent" });
  await development.listen();
  production = await preview({ preview: { host: "127.0.0.1", port: 0 }, logLevel: "silent" });
  for (const [label, server] of [["dev", development.httpServer], ["preview", production.httpServer]]) {
    const base = `http://127.0.0.1:${server.address().port}`;
    const body = JSON.stringify({ action: "route-probe-invalid" });
    const response = await fetch(`${base}/api/auth?probe=route`, {
      method: "POST", headers: { "content-type": "application/json", authorization: "Bearer isolated-fixture" }, body,
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(response.status, 400, `${label}: /api/auth must reach the backend instead of returning 404`);
    assert.match(response.headers.get("content-type") || "", /application\/json/, `${label}: API must not return the SPA`);
    assert.deepEqual(await response.json(), { error: "Unknown action" });
    assert.deepEqual(received.at(-1), { url: "/api/auth?probe=route", method: "POST", body, authorization: "Bearer isolated-fixture" });
    const route = await fetch(`${base}/map`);
    assert.equal(route.status, 200, `${label}: public page routes must keep working`);
    assert.match(await route.text(), /<div id="root">/);
    console.log(`PASS ${label}: API body, query and authorization reach backend; page routes remain available`);
  }
} finally {
  await development?.close();
  await production?.close();
  await new Promise(resolve => upstream.close(resolve));
  if (previousTarget === undefined) delete process.env.API_PROXY_TARGET;
  else process.env.API_PROXY_TARGET = previousTarget;
}
