import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import vitePluginStats from "./scripts/vite-plugin-stats.js";

// https://astro.build/config
export default defineConfig({
  site:
    process.env.VERCEL_ENV === "production"
      ? "https://astro.badg.es/"
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/`
      : "https://localhost:4321/",
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    plugins: [vitePluginStats()],
  },
});
