import { isDeepStrictEqual } from "node:util";

import { setOutput, warning } from "@actions/core";
import { context, type getOctokit } from "@actions/github";
import type { PullRequestEvent } from "@octokit/webhooks-types";

import type { Baseline, ProccessedMetric } from "../types";
import { toComparableBaseline } from "./utils";

const DEFAULT_UPDATE_COMMIT_AUTHOR = "github-actions[bot]";

async function publishComment(
	content: string,
	octokit: ReturnType<typeof getOctokit>,
) {
	const prNumber = context.payload.pull_request?.number;

	if (!prNumber) {
		warning("Not running in a PR context, skipping comment");
		return;
	}

	const { data: comments } = await octokit.rest.issues.listComments({
		...context.repo,
		issue_number: prNumber,
	});
	const prev = comments.find((c) => c.body?.includes("📊 Code Coverage"));

	if (prev) {
		await octokit.rest.issues.deleteComment({
			...context.repo,
			comment_id: prev.id,
		});
	}

	await octokit.rest.issues.createComment({
		...context.repo,
		issue_number: prNumber,
		body: content,
	});
}

async function fetchBaseline(
	octokit: ReturnType<typeof getOctokit>,
	baselinePath: string,
	baselineBranch: string,
): Promise<Baseline | null> {
	try {
		const { data } = await octokit.rest.repos.getContent({
			...context.repo,
			path: baselinePath,
			ref: baselineBranch,
		});

		const content = Buffer.from((data as any).content, "base64").toString();
		return {
			...JSON.parse(content),
			sha: (data as any).sha,
		};
	} catch {
		return null;
	}
}

async function updateBaseline(
	octokit: ReturnType<typeof getOctokit>,
	originalBaseline: Baseline | null,
	updatedBaseline: Baseline,
	baselinePath: string,
) {
	if (
		originalBaseline &&
		isDeepStrictEqual(
			toComparableBaseline(originalBaseline),
			toComparableBaseline(updatedBaseline),
		)
	) {
		warning("No changes detected in baseline, skipping update...");
		return;
	}

	const content = Buffer.from(
		JSON.stringify(updatedBaseline, null, 2),
	).toString("base64");
	const payload = context.payload as PullRequestEvent;
	const branch = payload.pull_request?.head.ref;

	let fileSha: string | undefined;

	try {
		const { data } = await octokit.rest.repos.getContent({
			...context.repo,
			path: baselinePath,
			ref: branch,
		});

		fileSha = (data as any).sha; // Types are not catching all properties
	} catch {
		// There is no file, first time this runs
	}

	await octokit.rest.repos.createOrUpdateFileContents({
		...context.repo,
		path: baselinePath,
		message: `chore: Update jacoco baseline [${context.sha.slice(0, 7)}]`,
		content,
		branch,
		...(fileSha ? { sha: fileSha } : {}),
	});
}

async function getLatestCommitAuthor(
	octokit: ReturnType<typeof getOctokit>,
): Promise<string> {
	const payload = context.payload as PullRequestEvent;
	const { data } = await octokit.rest.repos.getCommit({
		...context.repo,
		ref: payload.pull_request.head.sha,
	});

	return data.commit.author?.name ?? DEFAULT_UPDATE_COMMIT_AUTHOR;
}

// Will prevent infinite loops
async function isLatestCommitValid(
	octokit: ReturnType<typeof getOctokit>,
	updateAuthor: string,
): Promise<boolean> {
	const lattestCommitAuthor = await getLatestCommitAuthor(octokit);

	return lattestCommitAuthor === updateAuthor;
}

function publishActionOutput(metricData: ProccessedMetric[]) {
	metricData.forEach((metric) => {
		if (metric.extractedData) {
			setOutput(metric.data.output.name, metric.extractedData.pct);
		}
	});
}

export {
	fetchBaseline,
	isLatestCommitValid,
	publishActionOutput,
	publishComment,
	updateBaseline,
};
