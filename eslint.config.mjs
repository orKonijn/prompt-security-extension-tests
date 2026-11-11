import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";
import prettier from "eslint-config-prettier/flat";

export default defineConfig(
  {
    ignores: [
      "node_modules/**",
      ".local/**",
      "test-results/**",
      "playwright-report/**",
    ],
  },
  {
    files: ["**/*.mjs"],
    extends: [js.configs.recommended],
  },
  {
    files: ["tests/**/*.ts", "playwright.config.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "explicit" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "error",
      "playwright/prefer-web-first-assertions": "error",
      "playwright/no-wait-for-timeout": "error",
    },
  },
  {
    files: ["tests/**/*.spec.ts"],
    rules: {
      "playwright/expect-expect": [
        "error",
        {
          assertFunctionNames: ["expect", "expectAllowed", "expectBlocked"],
        },
      ],
    },
  },
  prettier,
);
