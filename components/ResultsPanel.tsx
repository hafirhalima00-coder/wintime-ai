import type { AnalysisResult, Issue, Severity } from "@/types/analysis";
import IssueCard from "./IssueCard";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const SEVERITY_COUNT_STYLES: Record<Severity, string> = {
  critical: "text-red-400",
  high:     "text-orange-400",
  medium:   "text-yellow-400",
  low:      "text-blue-400",
};

interface ResultsPanelProps {
  result: AnalysisResult;
}

export default function ResultsPanel({ result }: ResultsPanelProps) {
  const { issues, summary } = result;

  // Group issues by severity, preserving order
  const grouped = SEVERITY_ORDER.reduce<Record<Severity, Issue[]>>(
    (acc, sev) => {
      acc[sev] = issues.filter((i) => i.severity === sev);
      return acc;
    },
    { critical: [], high: [], medium: [], low: [] }
  );

  return (
    <div className="w-full max-w-3xl mx-auto">

      {/* Summary bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg px-6 py-4 mb-8 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-2xl font-bold text-gray-100">{summary.total}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">
            {summary.total === 1 ? "Issue found" : "Issues found"}
          </p>
        </div>

        <div className="w-px h-10 bg-gray-800 hidden sm:block" />

        <div className="flex gap-5 flex-wrap">
          {SEVERITY_ORDER.map((sev) => {
            const count = summary.bySeverity[sev];
            return (
              <div key={sev} className="text-center">
                <p className={`text-lg font-semibold ${SEVERITY_COUNT_STYLES[sev]}`}>
                  {count}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  {SEVERITY_LABEL[sev]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issues grouped by severity */}
      {SEVERITY_ORDER.map((sev) => {
        const group = grouped[sev];
        if (group.length === 0) return null;

        return (
          <section key={sev} className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <span className={SEVERITY_COUNT_STYLES[sev]}>
                {SEVERITY_LABEL[sev]}
              </span>
              <span>ÔÇö {group.length} {group.length === 1 ? "issue" : "issues"}</span>
            </h2>
            <div className="flex flex-col gap-3">
              {group.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
