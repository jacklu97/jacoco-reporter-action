import { setOutput, warning } from "@actions/core"; 
import { getOctokit, context } from "@actions/github";
import { ProccessedMetric } from "../types";

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

function publishActionOutput(metricData: ProccessedMetric[]) {
  metricData.forEach(metric => {
    if (metric.extractedData) {
      setOutput(metric.data.output.name, metric.extractedData.pct)
    }
  })
}

export {
    publishComment,
    publishActionOutput
}