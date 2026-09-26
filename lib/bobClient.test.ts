/**
 * lib/bobClient.test.ts
 *
 * Smoke test ÔÇö verifies that BOB_API_KEY is set and the inference endpoint
 * responds to a minimal request without erroring.
 *
 * Run manually (not part of Next.js build):
 *   npx ts-node --project tsconfig.json lib/bobClient.test.ts
 *
 * Prerequisites:
 *   - .env.local must contain BOB_API_KEY (and BOB_TEAM_ID if using a General key)
 *   - Internet access to api.us-east.bob.ibm.com
 *
 * This file does NOT use any test framework on purpose ÔÇö zero extra dependencies.
 */

// Load .env.local before anything else.
// ESM static imports are hoisted, so we use a dynamic import() for bobClient
// AFTER env vars are populated ÔÇö otherwise BOB_MODEL etc. read as undefined.
import fs from "fs";
import path from "path";

function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.warn("[smoke] .env.local not found ÔÇö relying on existing env vars");
    return;
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const SMOKE_FILE = {
  path: "test-snippet.js",
  content: `
// Smoke test snippet
const API_KEY = 'hardcoded-secret-123';
function greet(name) {
  console.log('Hello ' + name);
}
`.trim(),
};

async function run(): Promise<void> {
  console.log("[smoke] Starting connectivity test against Bob inference API...");
  console.log("[smoke] BOB_API_KEY present:", Boolean(process.env.BOB_API_KEY));
  console.log("[smoke] BOB_TEAM_ID present:", Boolean(process.env.BOB_TEAM_ID));
  console.log("[smoke] BOB_MODEL:", process.env.BOB_MODEL ?? "(default)");

  // Dynamic import AFTER env is loaded ÔÇö avoids ESM hoisting issue
  const { analyzeCode } = await import("./bobClient.js");

  try {
    const result = await analyzeCode([SMOKE_FILE]);
    console.log("[smoke] Ô£ô Success! Bob returned", result.issues.length, "issue(s).");
    console.log("[smoke] Summary:", JSON.stringify(result.summary, null, 2));
    console.log(
      "[smoke] First issue:",
      result.issues[0]
        ? JSON.stringify(result.issues[0], null, 2)
        : "(none)"
    );
    process.exit(0);
  } catch (err) {
    console.error("[smoke] Ô£ù Test failed:");
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

run();
