import type { PluginOptionsByType } from "chart.js";
import { allRepos, statsFromLast30Days } from "issues:stats";

export function getStatsForRepo(repo: string) {
  return Object.values(statsFromLast30Days).map((stats) => {
    return stats.data?.[repo]?.issueCount ?? 0;
  });
}

export function getAverageIssueCountForRepo(repo: string, lastDays = 5) {
  const data = getStatsForRepo(repo).slice(-lastDays);
  const sum = data.reduce((a, b) => a + b, 0);
  const avg = sum / data.length || 0;

  return avg;
}

export const allReposData = {
  labels: [...Object.keys(statsFromLast30Days)],
  datasets: [
    ...allRepos.map((repo) => ({
      label: repo,
      data: getStatsForRepo(repo),
      borderWidth: 1,
      fill: true,
      hidden: getAverageIssueCountForRepo(repo) < 7,
    })),
  ],
};

export const sortedReposWithHighIssues = allReposData.datasets
  .filter((dataset) => !dataset.hidden)
  .sort((a, b) => {
    const aToday = a.data.at(-1)!;
    const bToday = b.data.at(-1)!;

    return bToday - aToday;
  });

export const todayData = {
  labels: sortedReposWithHighIssues.map((dataset) => dataset.label),
  datasets: [
    {
      label: "Issues",
      data: sortedReposWithHighIssues.map((dataset) => dataset.data.at(-1)),
    },
  ],
};

export const sortLegend: PluginOptionsByType<
  "pie" | "line"
>["legend"]["labels"]["sort"] = (a, b) =>
  getAverageIssueCountForRepo(b.text) - getAverageIssueCountForRepo(a.text);

export const sortTooltips: PluginOptionsByType<
  "pie" | "line"
>["tooltip"]["itemSort"] = (a, b) => b.parsed.y - a.parsed.y;
