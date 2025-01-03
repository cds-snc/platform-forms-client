import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});
const eslintConfig = [
  ...compat.config({
    extends: ["next", "prettier"],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "no-console": "error",
      "no-await-in-loop": "error",
      "no-return-await": "error",
    },
    ignorePatterns: ["/utils", "/public/static/scripts/", "/__tests__/api/"],
  }),
];
export default eslintConfig;
