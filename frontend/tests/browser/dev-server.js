import { createServer } from "vite";
import { createServer as reservePort } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Keep browser fixtures off the developer's running Vite port and dependency cache.
export async function startDevServer() {
  // Vite treats port: 0 as its default port, so reserve a positive free port.
  const port = await new Promise((resolve, reject) => {
    const reservation = reservePort();
    reservation.once("error", reject);
    reservation.listen(0, "127.0.0.1", () => {
      const availablePort = reservation.address().port;
      reservation.close((error) =>
        error ? reject(error) : resolve(availablePort),
      );
    });
  });
  const temporaryDir = await mkdtemp(join(tmpdir(), "harborx-browser-vite-"));
  const cacheDir = join(temporaryDir, "node_modules", ".vite");
  let server;
  try {
    server = await createServer({
      root: fileURLToPath(new URL("../../", import.meta.url)),
      cacheDir,
      server: {
        host: "127.0.0.1",
        port,
        strictPort: true,
        proxy: {
          "/api": { target: "http://127.0.0.1:4173", changeOrigin: false },
        },
      },
    });
    await server.listen();
    return {
      url: `http://127.0.0.1:${server.httpServer.address().port}`,
      async close() {
        await server.close();
        await rm(temporaryDir, { recursive: true, force: true });
      },
    };
  } catch (error) {
    await server?.close();
    await rm(temporaryDir, { recursive: true, force: true });
    throw error;
  }
}
