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
    files: [
      "tests/**/*.ts",
      "fixtures/**/*.ts",
      "pages/**/*.ts",
      "resources/**/*.ts",
      "support/**/*.ts",
      "playwright.config.ts",
    ],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "@typescript-eslint/member-ordering": [
        "error",
        {
          default: {
            memberTypes: [
              "field",
              "constructor",
              ["public-method", "public-get", "public-set"],
              ["protected-method", "protected-get", "protected-set"],
              ["private-method", "private-get", "private-set"],
            ],
          },
        },
      ],
      "no-param-reassign": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "explicit" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
        },
      ],
    },
  },
  {
    ...playwright.configs["flat/recommended"],
    files: ["tests/**/*.ts", "fixtures/**/*.ts", "pages/**/*.ts"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "error",
      "playwright/prefer-web-first-assertions": "error",
      "playwright/no-wait-for-timeout": "error",
      "playwright/no-commented-out-tests": "error",
      "playwright/no-nth-methods": "error",
      "playwright/no-magic-timeouts": "error",
      "playwright/prefer-native-locators": "error",
      "playwright/prefer-strict-equal": "error",
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
