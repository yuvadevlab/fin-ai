/* eslint-disable react-refresh/only-export-components */
import React, { useEffect } from "react";
import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { TooltipProvider } from "../src/primitives/tooltip";
import { Toaster } from "../src/primitives/sonner";
import "./storybook.css";

/**
 * Global Storybook preview configuration for @finai/ui.
 *
 * Decorators:
 * - Wraps every story in TooltipProvider (required by Radix tooltips).
 * - Mounts Toaster for components that use toast() calls.
 * - Applies light/dark body class to enable CSS token switching.
 */
function FinAIProviderWrapper({ children, theme }: { children: React.ReactNode; theme: string }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <TooltipProvider>
      <div className="font-sans antialiased">{children}</div>
      <Toaster />
    </TooltipProvider>
  );
}

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <FinAIProviderWrapper theme={context.globals.theme ?? "light"}>
        <Story />
      </FinAIProviderWrapper>
    ),
  ],

  globalTypes: {
    theme: {
      description: "Global theme for components",
      toolbar: {
        title: "Theme",
        icon: "circle",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
      defaultValue: "light",
    },
  },

  parameters: {
    // A11y addon: run axe checks on every story automatically
    a11y: {
      config: {
        rules: [
          // Enforce colour contrast at WCAG AA level
          { id: "color-contrast", enabled: true },
          // Require all interactive elements to have accessible names
          { id: "button-name", enabled: true },
          // Require form fields to have associated labels
          { id: "label", enabled: true },
        ],
      },
      // Fail stories in the a11y panel that have violations
      manual: false,
    },
    viewport: {
      viewports: {
        ...INITIAL_VIEWPORTS,
        tailwindSm: {
          name: "Tailwind sm (640px)",
          styles: { width: "640px", height: "900px" },
          type: "mobile",
        },
        tailwindMd: {
          name: "Tailwind md (768px)",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        tailwindLg: {
          name: "Tailwind lg (1024px)",
          styles: { width: "1024px", height: "768px" },
          type: "desktop",
        },
        tailwindXl: {
          name: "Tailwind xl (1280px)",
          styles: { width: "1280px", height: "800px" },
          type: "desktop",
        },
        tailwind2Xl: {
          name: "Tailwind 2xl (1536px)",
          styles: { width: "1536px", height: "960px" },
          type: "desktop",
        },
        ultrawide: {
          name: "UltraWide 4K (1920px)",
          styles: { width: "1920px", height: "1080px" },
          type: "desktop",
        },
      },
      defaultViewport: "responsive",
    },

    backgrounds: {
      disable: true, // We use our custom theme toolbar instead
    },

    layout: "padded",

    docs: {
      // Auto-generate docs page for every component from its stories
      autodocs: "tag",
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
