import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "next/typescript", // @typescript-eslint/recommended
      "prettier"
    ],
    rules: {
      "@next/next/no-page-custom-font": "off",
      "react/no-unescaped-entities": "off",
      "no-await-in-loop": "error",
      "no-return-await": "error",
      "import/no-unresolved": "error",
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "error",
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
      "@typescript-eslint/no-unused-expressions": "off",
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
