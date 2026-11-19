import React from "react";
import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/providers";
import { appearanceScript } from "@/lib/appearance-script";
import { APP_ID } from "@/lib/app-constants";
import { getServerAuth } from "@/lib/server-auth";
import { COMMON_COPY } from "@/lib/ui-copy/common";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fin-ai-yuvadevlab.vercel.app";

// eslint-disable-next-line react-refresh/only-export-components
export const viewport: Viewport = {
  themeColor: "#37b976",
};

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: COMMON_COPY.METADATA.TITLE,
    template: COMMON_COPY.METADATA.TITLE_TEMPLATE,
  },
  description: COMMON_COPY.METADATA.DESCRIPTION,
  applicationName: COMMON_COPY.BRAND.APP_NAME,
  authors: [{ name: COMMON_COPY.METADATA.AUTHOR, url: COMMON_COPY.METADATA.AUTHOR_URL }],
  creator: COMMON_COPY.METADATA.AUTHOR,
  publisher: COMMON_COPY.METADATA.AUTHOR,
  keywords: [...COMMON_COPY.METADATA.KEYWORDS],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: COMMON_COPY.METADATA.SITE_NAME,
    title: COMMON_COPY.METADATA.OG_TITLE,
    description: COMMON_COPY.METADATA.OG_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: COMMON_COPY.METADATA.OG_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: COMMON_COPY.METADATA.OG_TITLE,
    description: COMMON_COPY.METADATA.OG_DESCRIPTION,
    images: ["/opengraph-image"],
    creator: "@yuvadevlab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * Root SSR Server Layout for FinAI.
 * Wraps page tree in appearance script and the unified AppProviders component.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const auth = await getServerAuth();

  return (
    <html lang="en" data-brand={APP_ID} data-theme={APP_ID} suppressHydrationWarning>
      <head>
        {/*
         * Blocking script — must live in <head> so it runs synchronously
         * before the first paint. See src/lib/appearance-script.ts for details.
         */}
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body className="fn-app-body">
        {/*
         * Skip-to-content link — visually hidden until focused via Tab key.
         * Allows keyboard-only and screen-reader users to bypass the sidebar
         * navigation and jump straight to the main page content.
         */}
        <a href="#main-content" className="fn-skip-to-content">
          {COMMON_COPY.A11Y.SKIP_TO_CONTENT}
        </a>

        <AppProviders initialToken={auth?.token}>{children}</AppProviders>
      </body>
    </html>
  );
}
