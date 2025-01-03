import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: new URL(".", import.meta.url).pathname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    plugins: ["jsx-a11y", "react", "react-hooks", "@typescript-eslint"],
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
      "@typescript-eslint/no-unused-vars": ["error", {
        caughtErrors: "none"
      }],
      "@typescript-eslint/no-unused-expressions":  "off",
      "@typescript-eslint/no-require-imports": "off",
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
