/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import type { Preview } from "@storybook/react";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider, Toaster } from "@finai/ui";
import "@finai/ui/styles.css";
import "../src/app/globals.css";

function StorybookWrapper({ children, theme }: { children: React.ReactNode; theme: string }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: Infinity,
          },
        },
      }),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    return () => document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="font-sans antialiased">{children}</div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <StorybookWrapper theme={context.globals.theme ?? "light"}>
        <Story />
      </StorybookWrapper>
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
    nextjs: {
      appDirectory: true,
    },

    layout: "padded",

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

    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "button-name", enabled: true },
          { id: "label", enabled: true },
        ],
      },
      manual: false,
    },
  },
};

export default preview;
