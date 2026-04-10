import { CoverageResult } from "../types";

function extractFrom(xmlContent: string, typeToSearch: string): CoverageResult {
  const re = new RegExp(
    `<counter type="${typeToSearch}" missed="(\\d+)" covered="(\\d+)"`,
    "g",
  );
  const matches = [...xmlContent.matchAll(re)];
  const m = matches.at(-1);
  if (!m) return null;
  const missed = +m[1],
    covered = +m[2];
  return {
    missed,
    covered,
    pct: +((covered / (covered + missed)) * 100).toFixed(1),
  };
}

function safeRun<T>(cb: Function): T | null {
  try {
    const result = cb();
    return result;
  } catch {
    return null;
  }
}

export {
  extractFrom,
  safeRun
}