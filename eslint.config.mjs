import { FlatCompat } from "@eslint/eslintrc";

import { jsxA11y } from "eslint-plugin-jsx-a11y";
import * as tseslint from "@typescript-eslint/eslint-plugin";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    plugins: {
      "jsx-a11y": jsxA11y,
      "@typescript-eslint": tseslint,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "no-console": "error",
      "no-await-in-loop": "error",
      "no-return-await": "error",
      "import/no-unresolved": "error",
      "@typescript-eslint/no-require-imports": "off",
      "no-unused-vars": "off", // Turn off base rule
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
    },
    ignorePatterns: [
      "/utils",
      "/public/static/scripts/",
      "/__tests__/api/",
      "node_modules/",
      "dist/",
      "coverage/",
    ],
  }),
];

export default eslintConfig;
