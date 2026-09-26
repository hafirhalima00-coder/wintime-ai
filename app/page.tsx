"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";
import LoadingSpinner from "@/components/LoadingSpinner";
import ResultsPanel from "@/components/ResultsPanel";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: AnalysisResult }
  | { status: "error"; message: string };

const MIN_LOADING_MS = 1000;

async function runAnalysis(): Promise<AnalysisResult> {
  const [res] = await Promise.all([
    fetch("/api/analyze", { method: "POST" }),
    new Promise<void>((resolve) => setTimeout(resolve, MIN_LOADING_MS)),
  ]);

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // ignore parse error, keep the status message
    }
    throw new Error(message);
  }

  return res.json() as Promise<AnalysisResult>;
}

export default function HomePage() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleAnalyze() {
    setState({ status: "loading" });
    try {
      const result = await runAnalysis();
      setState({ status: "success", result });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-3xl font-bold tracking-tight text-gray-100">
            Wintime AI
          </span>
          <span className="text-xs font-semibold bg-blue-900 text-blue-300 border border-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
            Beta
          </span>
        </div>
        <p className="text-base text-gray-500 max-w-lg mx-auto">
          IBM Bob analyzes your codebase and surfaces bugs, security risks,
          and missing test coverage ÔÇö instantly.
        </p>
      </div>

      {/* Idle state ÔÇö hero CTA */}
      {state.status === "idle" && (
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-lg p-5 text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Demo project
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                "src/server.js",
                "src/routes/api.js",
                "src/db.js",
                "package.json",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 shrink-0" />
                  <span className="font-mono text-xs text-gray-400">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4">
              Node.js / Express ┬À 4 files ┬À known issues seeded
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-colors"
          >
            Analyze Demo Project
          </button>
          <p className="text-xs text-gray-600">
            Powered by IBM Bob ┬À inference API
          </p>
        </div>
      )}

      {/* Loading state */}
      {state.status === "loading" && <LoadingSpinner />}

      {/* Error state */}
      {state.status === "error" && (
        <div className="w-full max-w-3xl mb-10">
          <div className="bg-red-950 border border-red-800 rounded-lg px-5 py-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-400 mb-1">
                Analysis failed
              </p>
              <p className="text-xs text-red-300 font-mono break-all">
                {state.message}
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              className="shrink-0 text-xs text-red-400 border border-red-700 rounded px-3 py-1.5 hover:bg-red-900 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {state.status === "success" && (
        <>
          <div className="w-full max-w-3xl mb-6 flex items-center justify-between">
            <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Analysis report
            </h1>
            <button
              onClick={() => setState({ status: "idle" })}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Reset
            </button>
          </div>
          <ResultsPanel result={state.result} />
        </>
      )}

      {/* Footer */}
      <footer className="mt-16 text-xs text-gray-700 border-t border-gray-900 pt-6 w-full max-w-3xl text-center">
        Wintime AI ┬À IBM Bob 2.0 Hackathon ┬À Powered by IBM Bob
      </footer>
    </main>
  );
}
