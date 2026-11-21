import { spawnSync } from "node:child_process";

const testUrl = process.env.STYLEFIT_TEST_DATABASE_URL;
const database = testUrl && URL.parse(testUrl);
if (!database || !["postgres:", "postgresql:"].includes(database.protocol)
  || !["127.0.0.1", "localhost", "[::1]"].includes(database.hostname) || !/^\/[^/]+_test$/.test(database.pathname)
  || testUrl === process.env.DATABASE_URL) {
  console.error("Set STYLEFIT_TEST_DATABASE_URL to a dedicated database ending in _test.");
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: testUrl, STYLEFIT_ACCOUNT_TEST: "1" };
for (const args of [
  ["run", "db:migrate"],
  ["run", "test:e2e", "--", "--project=desktop", "--workers=1"],
  ["run", "test:e2e", "--", "--project=mobile-390", "--workers=1"],
]) {
  const result = spawnSync("npm", args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
