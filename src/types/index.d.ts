import { context } from "@actions/github";

type CoverageResult = CoverageMetric | null;

interface CoverageMetric {
  missed: number;
  covered: number;
  pct: number;
}

interface Baseline {
  line: number;
  branch: number;
  method: number;
  complexity: number;
  class: number;
  sha: string;
}

interface ResultCommentParams {
  metrics: ProccessedMetric[];
  baseline: Baseline | null;
  ctx: typeof context;
}

interface OutputData {
  label: string;         // Value used in result table
  key: keyof Baseline;   // Key used on baseline obj
  name: string;          // Name of output to be printed by action itself
}

interface MetricData {
  xmlField: string;   // Field as written in XML file
  output: OutputData; // Output data related
}

interface ProccessedMetric {
  data: MetricData;
  extractedData: CoverageResult
}

export {
  CoverageResult,
  CoverageMetric,
  Baseline,
  ResultCommentParams,
  MetricData,
  ProccessedMetric
};
