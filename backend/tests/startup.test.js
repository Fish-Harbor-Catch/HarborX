import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { cp, mkdtemp, rm, symlink } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

async function startIsolated(t, port) {
  // Copy source so the real entry point uses a disposable embedded database.
  const directory = await mkdtemp(join(tmpdir(), "harborx-startup-"));
  await cp(new URL("../src/", import.meta.url), join(directory, "src"), {
    recursive: true,
  });
  await cp(new URL("../package.json", import.meta.url), join(directory, "package.json"));
  await symlink(
    fileURLToPath(new URL("../../node_modules", import.meta.url)),
    join(directory, "node_modules"),
    "dir",
  );
  const child = spawn(process.execPath, ["src/server.js"], {
    cwd: directory,
    env: {
      ...process.env,
      NODE_ENV: "development",
      DATABASE_URL: "",
      DEMO_SEED: "false",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.stderr.on("data", (chunk) => (output += chunk));
  const exited = once(child, "exit");
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
    await exited;
    await rm(directory, { recursive: true, force: true });
  });
  return { child, exited, output: () => output };
}

test("entry point stays alive, serves health and shuts down cleanly", { timeout: 20000 }, async (t) => {
  const server = await startIsolated(t, 0);
  const deadline = Date.now() + 15000;
  let port;
  while (Date.now() < deadline) {
    port = server.output().match(/HarborX API: http:\/\/localhost:(\d+)/)?.[1];
    if (port) break;
    assert.equal(server.child.exitCode, null, server.output());
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(port, server.output());
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).database, "embedded-postgresql");
  assert.equal(server.child.exitCode, null);
  server.child.kill("SIGTERM");
  assert.equal((await server.exited)[0], 0);
});

test("occupied port fails with an error and never announces API readiness", { timeout: 20000 }, async (t) => {
  const blocker = createServer().listen(0, "0.0.0.0");
  await once(blocker, "listening");
  t.after(() => new Promise((resolve) => blocker.close(resolve)));
  const server = await startIsolated(t, blocker.address().port);
  assert.notEqual((await server.exited)[0], 0);
  assert.match(server.output(), /EADDRINUSE/);
  assert.doesNotMatch(server.output(), /HarborX API: http/);
});
