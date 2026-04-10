import { MetricData } from "../types";

const METRIC_FIELDS: MetricData[] = [
  {
    xmlField: "LINE",
    output: {
      label: "Lines",
      key: "line",
      name: "line-coverage",
    },
  },
  {
    xmlField: "BRANCH",
    output: {
      label: "Branches",
      key: "branch",
      name: "branch-coverage",
    },
  },
  {
    xmlField: "METHOD",
    output: {
      label: "Methods",
      key: "method",
      name: "method-coverage",
    },
  },
  {
    xmlField: "COMPLEXITY",
    output: {
      label: "Complexity",
      key: "complexity",
      name: "complexity-coverage"
    }
  }
] as const;

export default METRIC_FIELDS;
