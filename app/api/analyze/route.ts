/**
 * app/api/analyze/route.ts
 *
 * POST /api/analyze
 *
 * Reads the demo project from disk, calls the Bob inference API,
 * and returns the structured AnalysisResult as JSON.
 *
 * Response shapes:
 *   200  { issues: Issue[], summary: AnalysisSummary }
 *   500  { error: string }
 */

import { NextResponse } from "next/server";
import { analyzeDemoProject } from "@/lib/analyzer";

export async function POST(): Promise<NextResponse> {
  try {
    const result = await analyzeDemoProject();
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/analyze] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
