/// <reference types="astro/client" />

declare module "issues:stats" {
  export const statsFromLast30Days: Record<
    string,
    {
      date: string;
      data: Record<
        string,
        { issuePerLabel: Record<string, number>; issueCount: number }
      >;
    }
  >;
  export const allRepos: string[];
}
