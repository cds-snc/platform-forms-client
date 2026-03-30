import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
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
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "utils/**",
    "**/dist/**",
    "public/static/scripts/polyfills/**",
    "coverage/**",
    ".lintstagedrc.mjs",
  ]),
  {
    rules: {
      "no-console": "error",
      "no-await-in-loop": "error",
      "no-return-await": "error",
      "react/no-jsx-in-try-catch": "off",
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
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='logMessage'][callee.property.name=/^(info|warn)$/] > ObjectExpression:first-child",
          message:
            "logMessage.info() and logMessage.warn() only accept string arguments. Use template literals instead: logMessage.info(`User: ${userId}`)",
        },
      ],
    },
  },
]);

export default eslintConfig;
