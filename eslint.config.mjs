import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  ...tailwind.configs["flat/recommended"],
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "utils/**",
    "**/dist/**",
  ]),
  {
    rules: {
      "no-console": "error",
      "no-await-in-loop": "error",
      "no-return-await": "error",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          ignoreRestSiblings: true,
          argsIgnorePattern: "^_",
          caughtErrors: "none",
        },
      ],
    },
    settings: {
      tailwindcss: {
        whitelist: [
          "(gc\\-).*",
          "(gcds\\-).*",
          "form-builder",
          "form-builder-editor",
          "page-container",
          "visually-hidden",
          "buttons",
          "required",
          "focus-group",
          "canada-flag",
          "account-wrapper",
          "input-sizer",
          "stacked",
          "disabled",
          "origin-radix-dropdown-menu",
          "radio-label-text",
          "checkbox-label-text",
          "example-text",
          "section",
          "maple-leaf-loader",
          "flow-container",
          "rich-text-wrapper",
          "editor",
          "editor-input",
          "link-editor",
          "link-input",
          "choice",
          "text-entry",
          "action",
          "wave",
          "bkd-soft",
          "legend-fieldset",
          "confirmation",
          "active",
          "brand__container",
          "fip_flag",
          "fip_text",
          "brand__toggle",
          "brand__signature",
          "container-xl",
          "tableLink",
        ],
      },
    },
  },
]);

export default eslintConfig;
