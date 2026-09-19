import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import tailwindcss from "eslint-plugin-tailwindcss";
import globals from "globals";
import path from "node:path";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

const rootDir = import.meta.dirname;
const cwd = process.cwd();
const isWeb = cwd.endsWith("apps/web");
const isUi = cwd.endsWith("packages/ui");

const webFiles = isWeb
  ? ["**/*.{ts,tsx}"]
  : ["apps/web/**/*.{ts,tsx}", "**/apps/web/**/*.{ts,tsx}"];
const uiFiles = isUi
  ? ["**/*.{ts,tsx}"]
  : ["packages/ui/**/*.{ts,tsx}", "**/packages/ui/**/*.{ts,tsx}"];

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/coverage/**",
      "**/build/**",
      "**/.output/**",
      "**/.vinxi/**",
      "**/.vercel/**",
      "**/out/**",
      "**/tsup.config.bundled*",
      "**/next-env.d.ts",
      "**/.storybook/**",
      "**/storybook-static/**",
    ],
  },
  {
    ...tailwindcss.configs.recommended,
    files: webFiles,
    rules: {
      ...tailwindcss.configs.recommended.rules,
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
    },
    settings: {
      tailwindcss: {
        callees: ["cn", "cva"],
        cssConfigPath: path.resolve(rootDir, "apps/web/src/app/globals.css"),
      },
    },
  },
  {
    ...tailwindcss.configs.recommended,
    files: uiFiles,
    rules: {
      ...tailwindcss.configs.recommended.rules,
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
    },
    settings: {
      tailwindcss: {
        callees: ["cn", "cva"],
        cssConfigPath: path.resolve(rootDir, "packages/ui/src/styles.css"),
      },
    },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message: "TanStack Start does not use the Next.js `server-only` package.",
            },
          ],
        },
      ],
      "no-console": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "max-lines": [
        "error",
        {
          max: 250,
          skipComments: true,
          skipBlankLines: true,
        },
      ],
      "max-len": [
        "warn",
        {
          code: 100,
          tabWidth: 2,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
  eslintPluginPrettier,
);
