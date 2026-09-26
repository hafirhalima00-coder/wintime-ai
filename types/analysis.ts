export type Severity = "critical" | "high" | "medium" | "low";

export interface Issue {
  id: number;
  severity: Severity;
  file: string;
  line: number;
  title: string;
  description: string;
  fix: string;
}

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface AnalysisSummary {
  total: number;
  bySeverity: SeverityCounts;
}

export interface AnalysisResult {
  issues: Issue[];
  summary: AnalysisSummary;
}

/** Shape of a source file passed to the Bob client */
export interface SourceFile {
  path: string;
  content: string;
}
