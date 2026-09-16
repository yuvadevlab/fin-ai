import type { StorybookConfig } from "@storybook/nextjs";

/**
 * FinAI Web — Storybook Next.js Configuration
 *
 * Provides isolated component development and testing for domain feature
 * components in apps/web, with built-in Next.js App Router and Image mocking.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],

  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],

  framework: {
    name: "@storybook/nextjs",
    options: {
      nextConfigPath: "../next.config.ts",
    },
  },

  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
