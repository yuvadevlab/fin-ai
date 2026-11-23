# FinAI — Public Marketing Website & Complete SEO Architecture

**Author:** `yuva.devlab@gmail.com`  
**Repository:** `yuvadevlab/fin-ai`  
**Status:** Implemented & Verified

---

## 1. Architectural Overview

FinAI transforms from an exclusively authenticated financial application into a publicly discoverable, SEO-optimized SaaS product website while strictly preserving its existing application architecture, data isolation, and centralized authentication through the Yuva DevLab Portal (`yuvadevlab/devlab-portal`).

### Route Topology & Separation Matrix

The application leverages Next.js App Router route groups to cleanly decouple public marketing pages from authenticated internal finance tools:

| Route Pattern           | Access Level                  | Indexing Directive     | Layout / Protection                              |
| :---------------------- | :---------------------------- | :--------------------- | :----------------------------------------------- |
| `/`                     | Public (Anonymous & Crawlers) | `index, follow`        | Marketing Shell (`PublicHeader`, `PublicFooter`) |
| `/features`             | Public                        | `index, follow`        | Marketing Shell                                  |
| `/expense-tracking`     | Public                        | `index, follow`        | Marketing Shell                                  |
| `/budget-planning`      | Public                        | `index, follow`        | Marketing Shell                                  |
| `/ai-financial-advisor` | Public                        | `index, follow`        | Marketing Shell                                  |
| `/wealth-management`    | Public                        | `index, follow`        | Marketing Shell                                  |
| `/financial-goals`      | Public                        | `index, follow`        | Marketing Shell                                  |
| `/about`                | Public                        | `index, follow`        | Marketing Shell                                  |
| `/blog`                 | Public                        | `index, follow`        | Marketing Shell                                  |
| `/blog/[slug]`          | Public (SSG prerendered)      | `index, follow`        | Marketing Shell (Article Schema)                 |
| `/privacy-policy`       | Public                        | `index, follow`        | Marketing Shell                                  |
| `/terms-of-service`     | Public                        | `index, follow`        | Marketing Shell                                  |
| `/robots.txt`           | Public                        | Dynamic crawler policy | Next.js Metadata Route                           |
| `/sitemap.xml`          | Public                        | Canonical public URLs  | Next.js Metadata Route                           |
| `/dashboard`            | Authenticated Only            | `noindex, nofollow`    | App Shell (`Sidebar`, `Header`) / SSO Redirect   |
| `/accounts`             | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/transactions`         | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/budgets`              | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/goals`                | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/investments`          | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/ai-advisor/*`         | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/reports`              | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |
| `/settings`             | Authenticated Only            | `noindex, nofollow`    | App Shell / SSO Redirect                         |

---

## 2. Centralized Authentication (DevLab Portal SSO)

FinAI does not host isolated credentials, password hashes, or independent authentication mechanisms. Centralized authentication operates via Yuva DevLab Portal:

1. **Anonymous Browsing Invariant**: Anonymous visitors and search engine crawlers (Googlebot, Bingbot) browsing public marketing pages (`/`, `/features`, `/blog`, etc.) are never intercepted or redirected to the login page.
2. **Action-Driven Sign In**: Clicking **"Sign In"** or **"Get Started Free"** in the public header/footer routes the user to DevLab Portal with standard query parameters:
   ```
   https://devlab-portal-yuvadevlab.vercel.app/login?app=finai&redirect=https%3A%2F%2Ffin-ai-yuvadevlab.vercel.app%2Fdashboard
   ```
3. **Post-Authentication Landing**: Upon successful authentication in DevLab Portal, the user is redirected to FinAI's authenticated workspace `/dashboard`.
4. **Guarded API Interceptor**: `api-client.ts` verifies route context so unauthenticated API 401s on public marketing pages do not trigger aggressive page reloads or unintended redirects.
5. **Conditional Workspace Fetching**: `WorkspaceProvider` only dispatches workspace hydration queries when a valid authentication token exists.

---

## 3. Technical SEO Implementation

### Canonical URL & Metadata System

Centralized in `src/lib/constants/seo.constants.ts`:

- **Base Domain**: `https://fin-ai-yuvadevlab.vercel.app` (configurable via `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL`).
- **Canonical URLs**: Every public page explicitly specifies an absolute canonical URL using `buildCanonicalUrl(path)`.
- **Open Graph & Twitter Cards**: Dynamic Open Graph images generated via `@vercel/og` Edge API (`/opengraph-image`) rendering branded 1200x630 social preview cards.
- **Favicons & App Icons**: Modern SVG icon (`/icon.svg`) and Apple touch icon (`/apple-icon`) served through Next.js icon conventions.

### Schema.org Structured Data (JSON-LD)

High-fidelity JSON-LD schemas are generated at render time without third-party dependencies:

1. **Organization (`src/app/(marketing)/layout.tsx`)**:
   - Declares `Yuva DevLab` as legal publisher, logo URL, and official repository links.
2. **WebSite (`src/app/(marketing)/layout.tsx`)**:
   - Declares `FinAI` site identity, description, and publisher association.
3. **SoftwareApplication (`src/app/(marketing)/page.tsx` & `/features`)**:
   - Types FinAI as `FinanceApplication`, lists key feature capabilities, and specifies free tier availability.
4. **FAQPage (`src/features/marketing/components/FaqSection.tsx`)**:
   - Structured Q&A entities matching the exact user-facing FAQ copy.
5. **Article (`src/app/(marketing)/blog/[slug]/page.tsx`)**:
   - Complete Schema.org Article specification including headline, datePublished, dateModified, author (`Yuva DevLab`), publisher, and canonical URL.

---

## 4. Robots.txt and Dynamic Sitemap

### `src/app/robots.ts`

- Whitelists all public marketing routes and static assets.
- Explicitly disallows private dashboard routes, workspaces, and internal APIs (`/dashboard`, `/transactions`, `/api/*`).
- Declares the canonical sitemap reference (`https://fin-ai-yuvadevlab.vercel.app/sitemap.xml`).

### `src/app/sitemap.ts`

- Generates standard XML sitemap dynamically.
- Includes `/`, `/features`, `/expense-tracking`, `/budget-planning`, `/ai-financial-advisor`, `/wealth-management`, `/financial-goals`, `/blog`, `/about`, `/privacy-policy`, and `/terms-of-service`.
- Dynamically iterates over all blog articles defined in `BLOG_POSTS` with accurate `lastmod`, `changefreq`, and `priority`.
- Strictly excludes all private dashboard routes.

---

## 5. Blog & Financial Education Architecture

The educational blog is located at `/blog` and individual articles at `/blog/[slug]`:

- **Static Site Generation (SSG)**: All blog posts prerender at build time via `generateStaticParams()`.
- **Core Educational Library**:
  1. _How to Manage Monthly Expenses Effectively: A Complete Guide_
  2. _How AI Is Changing Personal Finance Management_
  3. _How to Create and Maintain a Monthly Budget: The Definitive Guide_
  4. _AI Financial Advisor vs Traditional Financial Advisor: The Modern Comparison_
  5. _How to Track Family Expenses Without the Stress_
  6. _How to Analyze Your Spending Habits and Eliminate Financial Leaks_
  7. _How to Set and Achieve Financial Goals: An Engineer's Guide_
- **Copy Standards**: All content is factually accurate, structured with clear `H1/H2` hierarchy, includes key takeaways, estimated reading times, publication dates, and contextual CTAs back to product features.

---

## 6. Google Search Console Manual Operations Guide

Follow these sequential steps when connecting the deployed FinAI production domain to Google Search Console (GSC):

### Step 1: Add Property & Domain Verification

1. Open [Google Search Console](https://search.google.com/search-console).
2. Click **"Add Property"**.
3. Select **"URL prefix"** and enter the production domain:
   ```
   https://fin-ai-yuvadevlab.vercel.app
   ```
   _(Or the custom domain if mapped, e.g., `https://finai.yuvadevlab.com`)_.
4. Choose verification method:
   - **Recommended (HTML Tag)**: Copy the verification tag `content` string (e.g., `google-site-verification=XYZ...`) and add it to `FINAI_METADATA.GOOGLE_VERIFICATION` in `seo.constants.ts` or as an environment variable `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
   - **Alternative (DNS TXT)**: If using a custom root domain, add the Google TXT record to your DNS provider.
5. Click **"Verify"**.

### Step 2: Submit Dynamic Sitemap

1. In the left navigation menu under **"Indexing"**, click **"Sitemaps"**.
2. Under **"Add a new sitemap"**, enter:
   ```
   sitemap.xml
   ```
3. Click **"Submit"**.
4. Confirm the status changes to **"Success"**. GSC will report the discovered URLs (currently 18 public URLs).

### Step 3: Inspect URL & Run Live Test

1. At the top of the GSC interface, click the search bar **"Inspect any URL in 'https://fin-ai-yuvadevlab.vercel.app'"**.
2. Enter the homepage: `https://fin-ai-yuvadevlab.vercel.app/`.
3. Click **"Test Live URL"** to execute a real-time fetch with Googlebot Smartphone.
4. Verify:
   - **HTTP Response**: `200 OK`.
   - **Page Availability**: URL is available to Google.
   - **Rendered Screenshot**: Public header, hero section, and screenshot preview are fully rendered.
   - **Structured Data**: `Organization`, `WebSite`, and `SoftwareApplication` detected without warnings.
   - **Mobile Usability**: Page is usable on mobile.

### Step 4: Request Indexing

1. Once the live test succeeds, click **"Request Indexing"**.
2. Repeat for priority pillar pages:
   - `/features`
   - `/expense-tracking`
   - `/ai-financial-advisor`
   - `/blog/how-to-manage-monthly-expenses-effectively`
3. Note: Google restricts live indexing requests to a daily quota; standard sitemap discovery indexes the remaining URLs automatically.

### Step 5: Monitoring Coverage & Search Performance

1. **Pages Report**: Check weekly for:
   - _Indexed vs Not Indexed_ counts.
   - Confirm private routes (`/dashboard`, `/transactions`, etc.) correctly register as _Excluded by 'noindex' tag_ or _Blocked by robots.txt_.
2. **Enhancements Report**: Verify schema validation for:
   - _Software Application_
   - _Articles_
   - _FAQ_
3. **Core Web Vitals**: Monitor Largest Contentful Paint (LCP < 2.5s), Interaction to Next Paint (INP < 200ms), and Cumulative Layout Shift (CLS < 0.1).
4. **Performance Search Queries**: Track clicks, impressions, and CTR for key target queries:
   - _"AI personal finance tracker"_
   - _"AI financial advisor"_
   - _"automated expense tracking"_
   - _"smart budget planner"_

---

## 7. Design System & Compliance Standards

- **Pure Platform CSS**: 100% styled using pure platform CSS and W3C Cascade Layers (`@layer dl-components`, `@layer dl-utilities`). Zero mentions or usage of prohibited utility frameworks.
- **Design Token Integration**: Styled using `@yuva-devlab/tokens` CSS custom properties (`--dl-color-surface-*`, `--dl-color-text-*`, `--dl-radius-*`, `--dl-spacing-*`).
- **File Modularity**: All source files maintain strict line limits (< 250 lines) with high cohesion.
- **Centralized UI Copy**: All public landing copy, headings, descriptions, and FAQs are centralized in `src/lib/ui-copy/marketing.ts` with zero raw hardcoded strings.
