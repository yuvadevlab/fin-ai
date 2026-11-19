/**
 * @file apps/web/src/app/manifest.ts
 * @description Dynamic Web App Manifest configuration for FinAI.
 * @module @fin-ai/web/app
 */

import type { MetadataRoute } from "next";
import { COMMON_COPY } from "@/lib/ui-copy/common";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMMON_COPY.BRAND.APP_NAME,
    short_name: COMMON_COPY.BRAND.NAME,
    description: COMMON_COPY.METADATA.DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#06130d",
    theme_color: "#37b976",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
