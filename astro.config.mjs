import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://marcolini.dev",
  integrations: [mdx(), sitemap(), tailwind()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'kanagawa-wave',
        dark: 'kanagawa-wave',
      },
    },
  },
});
