/**
 * lib/bobClient.ts
 *
 * Thin wrapper around IBM Bob's inference API (OpenAI-compatible).
 *
 * Auth rules from Bob docs:
 *   - General key  ÔåÆ requires Authorization + x-team-id header
 *   - Inference key ÔåÆ requires Authorization only
 *
 * Set BOB_KEY_TYPE=inference in .env.local to skip the x-team-id header.
 * Default assumption is a General key (BOB_KEY_TYPE=general).
 */

import type { AnalysisResult, SourceFile } from "@/types/analysis";

// ÔöÇÔöÇÔöÇ constants ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

const TIMEOUT_MS = 60_000;

// Resolved at call time so that env vars loaded after module import take effect
function getBobBaseUrl(): string {
  return process.env.BOB_API_BASE_URL ?? "https://api.us-east.bob.ibm.com/inference/v1";
}

function getBobModel(): string {
  return process.env.BOB_MODEL ?? "ibm/granite-3-3-8b-instruct";
}

// ÔöÇÔöÇÔöÇ request / response shapes ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature: number;
  max_tokens: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ÔöÇÔöÇÔöÇ helpers ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function buildHeaders(): Record<string, string> {
  const apiKey = process.env.BOB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BOB_API_KEY is not set. Add it to .env.local and restart the dev server."
    );
  }

  const headers: Record<string, string> = {
    "Authorization": `Apikey ${apiKey}`,
    "Content-Type": "application/json",
    "User-Agent": "ibm-bob-wintime-ai",
  };

  // General keys require the team-id header; Inference keys do not.
  const keyType = process.env.BOB_KEY_TYPE ?? "general";
  if (keyType === "general") {
    const teamId = process.env.BOB_TEAM_ID;
    if (!teamId) {
      throw new Error(
        "BOB_KEY_TYPE is 'general' but BOB_TEAM_ID is not set. " +
        "Add BOB_TEAM_ID to .env.local, or set BOB_KEY_TYPE=inference."
      );
    }
    headers["x-team-id"] = teamId;
  }

  return headers;
}

function buildPrompt(files: SourceFile[]): string {
  const fileBlock = files
    .map((f) => `### File: ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  return `You are a senior software engineer performing a security and quality audit.
Analyze the following source files and return ONLY valid JSON ÔÇö no markdown fences, no prose, no explanation.

Return this exact JSON schema:
{
  "issues": [
    {
      "id": <number>,
      "severity": "critical" | "high" | "medium" | "low",
      "file": "<relative file path>",
      "line": <line number or 0 if unknown>,
      "title": "<short one-line title>",
      "description": "<one or two sentence explanation of the problem>",
      "fix": "<concrete one or two sentence fix recommendation>"
    }
  ],
  "summary": {
    "total": <number>,
    "bySeverity": {
      "critical": <number>,
      "high": <number>,
      "medium": <number>,
      "low": <number>
    }
  }
}

Look specifically for:
- Hardcoded secrets or API keys
- Missing input validation
- Missing try/catch around database or external calls
- Unhandled promise rejections
- Use of undefined environment variables without validation
- Missing error handling middleware
- Outdated or vulnerable dependency versions
- TODO/FIXME/HACK comments indicating incomplete safety work
- Functions with no test coverage (inferred from absent test files)

Source files to analyze:

${fileBlock}`;
}

/** Strip markdown code fences if the model wrapped its JSON response in them */
function stripFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

// ÔöÇÔöÇÔöÇ public API ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

export async function analyzeCode(files: SourceFile[]): Promise<AnalysisResult> {
  const headers = buildHeaders();
  const url = `${getBobBaseUrl()}/chat/completions`;

  const body: ChatCompletionRequest = {
    model: getBobModel(),
    messages: [
      {
        role: "user",
        content: buildPrompt(files),
      },
    ],
    temperature: 0.1,   // low temperature ÔåÆ consistent, deterministic JSON
    max_tokens: 2048,
  };

  // Abort after TIMEOUT_MS
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Bob inference request timed out after ${TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  // Surface authentication and rate-limit errors with clear messages
  if (!response.ok) {
    const text = await response.text().catch(() => "(no body)");
    if (response.status === 401) {
      throw new Error(
        `Bob API returned 401 Unauthorized. Check BOB_API_KEY in .env.local.\nBody: ${text}`
      );
    }
    if (response.status === 403) {
      throw new Error(
        `Bob API returned 403 Forbidden. Check BOB_TEAM_ID or key permissions.\nBody: ${text}`
      );
    }
    if (response.status === 429) {
      throw new Error(`Bob API returned 429 Too Many Requests (rate limited). Try again later.\nBody: ${text}`);
    }
    throw new Error(`Bob API error ${response.status} ${response.statusText}.\nBody: ${text}`);
  }

  const json = (await response.json()) as ChatCompletionResponse;

  // Debug: log raw response during development
  console.log("[bobClient] raw response:", JSON.stringify(json, null, 2));

  const rawContent = json.choices?.[0]?.message?.content ?? "";

  if (!rawContent) {
    throw new Error(
      "[bobClient] Bob returned an empty message content. Full response:\n" +
      JSON.stringify(json, null, 2)
    );
  }

  const cleaned = stripFences(rawContent);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `[bobClient] Bob's response was not valid JSON.\nRaw content:\n${rawContent}`
    );
  }

  // Runtime shape validation ÔÇö surfaces if the model drifted from the schema
  const result = parsed as AnalysisResult;
  if (!Array.isArray(result.issues) || typeof result.summary?.total !== "number") {
    throw new Error(
      `[bobClient] Bob returned JSON but it didn't match the expected schema.\n` +
      `Parsed: ${JSON.stringify(parsed, null, 2)}`
    );
  }

  return result;
}
