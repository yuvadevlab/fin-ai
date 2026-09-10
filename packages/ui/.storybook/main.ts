import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * FinAI UI — Storybook Configuration
 *
 * Stories are co-located next to their source files:
 *   src/components/StatCard.stories.tsx
 *   src/primitives/button.stories.tsx
 *   src/charts/CashFlowChart.stories.tsx
 *   src/layouts/*.stories.tsx
 *
 * Docs/MDX intro pages live in src/stories/*.mdx
 */
const config: StorybookConfig = {
  // Glob patterns to discover story files and MDX docs
  stories: ["../src/stories/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],

  addons: [
    // Core UX: Controls, Actions, Viewport, Backgrounds, Toolbars
    "@storybook/addon-essentials",
    // Accessibility: axe-core powered panel on every story
    "@storybook/addon-a11y",
    // Interactive docs — enables autodocs + MDX pages
    "@storybook/addon-docs",
  ],

  // Use the Vite builder so we share the same plugin chain as the library build
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  async viteFinal(config) {
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss());
    return config;
  },

  // Enable TypeScript prop table generation from source types
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      // Only include props that are directly defined on the component
      // (not inherited HTMLAttributes noise)
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
