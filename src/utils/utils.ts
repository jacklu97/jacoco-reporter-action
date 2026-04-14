import type { Baseline, CoverageResult, ProccessedMetric } from "../types";

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

function getUpdatedBaseline(metrics: ProccessedMetric[]): Baseline {
	return metrics.reduce(
		(acc, m) => ({
			...acc,
			[m.data.output.key]: m.extractedData?.pct ?? 0,
		}),
		{} as Baseline,
	);
}

function safeRun<T>(cb: () => T): T | null {
	try {
		return cb();
	} catch {
		return null;
	}
}

function toComparableBaseline({
	sha,
	...rest
}: Baseline): Omit<Baseline, "sha"> {
	return rest;
}

export { extractFrom, getUpdatedBaseline, safeRun, toComparableBaseline };
