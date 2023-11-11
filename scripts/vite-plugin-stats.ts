import type { Plugin } from "vite";

const VIRTUAL_MODULE_ID = "issues:stats";
const resolvedVirtualModuleId = "\0" + VIRTUAL_MODULE_ID;

// Those repos are not included in the stats, they're either not used, deprecated or uses issues in a different way
const IGNORED_REPOS = [
  ".github",
  "roadmap",
  "withastro.github.io",
  "view-transitions-demo",
  "astro-playground",
  "astro-repl",
  "netlify-adapter",
];

export default function vitePluginStats(): Plugin {
  return {
    name: "vite-plugin-stats",
    // Virtual module
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const allStats = import.meta.glob("/src/data/*.json");

        const statsFromLast30Days: StatObject = Object.fromEntries(
          await Promise.all(
            Object.entries(allStats)
              .filter(([key]) => {
                const date = new Date(
                  key.replace("/src/data/", "").replace(".json", ""),
                );

                const difference = dateDiffInDays(date, new Date());
                return difference < 30;
              })
              .map(async ([key, value]) => {
                return [
                  key.replace("/src/data/", "").replace(".json", ""),
                  (await (value as () => Promise<any>)()).default,
                ];
              }),
          ),
        );

        const allRepos = new Set<string>(
          Object.values(statsFromLast30Days).flatMap((repo: any) =>
            Object.keys(repo.data).filter(
              (key) => !IGNORED_REPOS.includes(key),
            ),
          ),
        );

        return `export const statsFromLast30Days = ${JSON.stringify(
          statsFromLast30Days,
        )};
				export const allRepos = ${JSON.stringify(Array.from(allRepos))};`;

        function dateDiffInDays(a: Date, b: Date) {
          const _MS_PER_DAY = 1000 * 60 * 60 * 24;
          // Discard the time and time-zone information.
          const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
          const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

          return Math.floor((utc2 - utc1) / _MS_PER_DAY);
        }
      }
    },
  };
}
