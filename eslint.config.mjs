import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tailwind from "eslint-plugin-tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...tailwind.configs["flat/recommended"],
  ...compat.config(
    { 
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "prettier"
    ],
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
          caughtErrors: "none", // This allows unused catch parameters
        },
      ],
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/enforces-shorthand": "off",
    },
    ignorePatterns: [
      "/utils",
      "/public/static/scripts/",
      "/__tests__/api/",
      "node_modules/",
      "dist/",
      "coverage/",
    ],
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
        ],
      },
    },
  }),
];

export default eslintConfig;
