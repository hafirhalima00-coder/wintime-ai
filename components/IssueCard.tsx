import type { Issue, Severity } from "@/types/analysis";

const SEVERITY_STYLES: Record<Severity, { badge: string; border: string }> = {
  critical: {
    badge: "bg-red-950 text-red-400 border border-red-800",
    border: "border-l-red-600",
  },
  high: {
    badge: "bg-orange-950 text-orange-400 border border-orange-800",
    border: "border-l-orange-500",
  },
  medium: {
    badge: "bg-yellow-950 text-yellow-400 border border-yellow-800",
    border: "border-l-yellow-500",
  },
  low: {
    badge: "bg-blue-950 text-blue-400 border border-blue-800",
    border: "border-l-blue-500",
  },
};

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const styles = SEVERITY_STYLES[issue.severity];

  return (
    <div
      className={`bg-gray-900 border border-gray-800 border-l-4 ${styles.border} rounded-lg p-5`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${styles.badge}`}
          >
            {issue.severity}
          </span>
          <span className="font-semibold text-gray-100 text-sm leading-snug">
            {issue.title}
          </span>
        </div>
        <span className="font-mono text-xs text-gray-500 shrink-0 pt-0.5">
          {issue.file}
          {issue.line > 0 ? `:${issue.line}` : ""}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-400 leading-relaxed mb-4">
        {issue.description}
      </p>

      {/* Fix */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Suggested fix
        </p>
        <pre className="text-xs text-gray-400 bg-gray-950 border border-gray-800 rounded p-3 whitespace-pre-wrap leading-relaxed">
          {issue.fix}
        </pre>
      </div>
    </div>
  );
}
