import { readFileSync } from "node:fs";
import { getInput, setFailed } from "@actions/core";
import { context, getOctokit } from "@actions/github";

import type { ProccessedMetric } from "./types";

import {
	ACTION_INPUTS,
	extractFrom,
	generateNoXmlComment,
	generateResultComment,
	METRIC_FIELDS,
	publishActionOutput,
	publishComment,
	safeRun,
} from "./utils";

// TODO: Define approach to get baseline
// function getBaseLine(): Baseline {
//   return { line: 0, branch: 0, method: 0, sha: '' }
// }

async function run() {
	const xmlPath = getInput(ACTION_INPUTS.JACOCO_XML_PATH);
	const token = getInput(ACTION_INPUTS.GITHUB_TOKEN);

	const octokit = getOctokit(token);

	let commentContent: string | undefined;

	const xml: string | null = safeRun(() => readFileSync(xmlPath, "utf-8"));

	if (!xml) {
		commentContent = generateNoXmlComment();
	} else {
		const processedMetricData: ProccessedMetric[] = METRIC_FIELDS.map(
			(metric) => {
				return {
					data: metric,
					extractedData: extractFrom(xml, metric.xmlField),
				};
			},
		);

		publishActionOutput(processedMetricData);

		const baseline = null;

		commentContent = generateResultComment({
			metrics: processedMetricData,
			ctx: context,
			baseline,
		});
	}

	await publishComment(commentContent, octokit);
}

run().catch(setFailed);
