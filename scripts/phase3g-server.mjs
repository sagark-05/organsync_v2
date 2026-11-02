// Explicitly authorized local browser-test host. Uses all normal API guards.
// These public fictional test values work only in this opt-in local process.
import next from "next";
import { createServer } from "node:http";
import { createRequire } from "node:module";
createRequire(import.meta.url)("@next/env").loadEnvConfig(process.cwd());
if (!process.argv.includes("--authorize-fictional-browser-testing")) throw new Error("Explicit fictional browser-testing authorization is required.");
Object.assign(process.env, { NODE_ENV: "development", ORGANSYNC_BROWSER_TEST_HOST: "true", ORGANSYNC_DEV_WRITES: "true", ORGANSYNC_DEV_DB_DEMO: "true", ORGANSYNC_DEV_SYNC: "true", ORGANSYNC_DEV_WRITE_TOKEN: "phase3g-local-fictional-browser-test-token-20261102" });
const app = next({ dev: true, hostname: "localhost", port: 3010, conf: { distDir: ".next-phase3g" } });
await app.prepare();
const server = createServer(app.getRequestHandler());
server.listen(3010, "127.0.0.1", () => console.log("Authorized fictional browser-test server ready at http://localhost:3010"));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, async () => { server.close(); await app.close(); process.exit(0); });
