import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      "next/core-web-vitals",
      "next/typescript",
      "prettier",],
    rules: {
      "no-console": "error",
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
