import { MetricData } from "../types";

const METRIC_FIELDS: MetricData[] = [
  {
    xmlField: "LINES",
    output: {
      label: "Lines",
      key: "line",
      name: "line-coverage",
    },
  },
  {
    xmlField: "BRANCHES",
    output: {
      label: "Branches",
      key: "branch",
      name: "branch-coverage",
    },
  },
  {
    xmlField: "METHODS",
    output: {
      label: "Methods",
      key: "method",
      name: "method-coverage",
    },
  },
] as const;

export default METRIC_FIELDS;
