/**
 * lib/analyzer.ts
 *
 * Reads all source files from the bundled demo project and invokes the Bob
 * client to produce a structured AnalysisResult.
 *
 * The demo project lives at public/demo-project/ relative to the Next.js root.
 * We use Node's `fs` module (server-side only ÔÇö this runs in API routes).
 */

import fs from "fs";
import path from "path";
import { analyzeCode } from "@/lib/bobClient";
import type { AnalysisResult, SourceFile } from "@/types/analysis";

// ÔöÇÔöÇÔöÇ file reading ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

/** Extensions we want to pass to Bob for analysis */
const INCLUDE_EXTENSIONS = new Set([".js", ".ts", ".json", ".env", ".md"]);

/** Directories to skip entirely */
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build"]);

/**
 * Recursively collects all analysable source files under `dir`.
 * Returns paths relative to `rootDir` so the prompt looks clean.
 */
function collectFiles(dir: string, rootDir: string): SourceFile[] {
  const results: SourceFile[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".env.example") {
      continue; // skip hidden files except .env.example
    }
    if (SKIP_DIRS.has(entry.name)) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, rootDir));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!INCLUDE_EXTENSIONS.has(ext) && ext !== "") {
        continue;
      }
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, "/");
        results.push({ path: relativePath, content });
      } catch {
        // skip unreadable files silently
      }
    }
  }

  return results;
}

/**
 * Reads all files from the demo project directory and returns them as an
 * array of SourceFile objects ready to send to the Bob client.
 */
export function readDemoProject(): SourceFile[] {
  // process.cwd() is the Next.js project root at runtime
  const demoDir = path.join(process.cwd(), "public", "demo-project");

  if (!fs.existsSync(demoDir)) {
    throw new Error(
      `Demo project directory not found at: ${demoDir}\n` +
      "Make sure public/demo-project/ exists."
    );
  }

  const files = collectFiles(demoDir, demoDir);

  if (files.length === 0) {
    throw new Error(`No analysable files found in ${demoDir}`);
  }

  console.log(
    `[analyzer] collected ${files.length} files:`,
    files.map((f) => f.path)
  );

  return files;
}

// ÔöÇÔöÇÔöÇ public entry point ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

/**
 * Full analysis pipeline:
 *   1. Read demo project files from disk
 *   2. Send to Bob inference API
 *   3. Return typed AnalysisResult
 */
export async function analyzeDemoProject(): Promise<AnalysisResult> {
  const files = readDemoProject();
  return analyzeCode(files);
}
