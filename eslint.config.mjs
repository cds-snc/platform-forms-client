import { defineConfig, globalIgnores } from "eslint/config";
import fs from "node:fs";
import path from "node:path";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";

const packagesDir = path.resolve("packages");
const packageDirList = fs.existsSync(packagesDir)
  ? fs
      .readdirSync(packagesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(packagesDir, entry.name))
  : [];

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
    files: ["packages/*/src/**/*.{js,jsx,ts,tsx,mts,cts}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/no-extraneous-dependencies": [
        "error",
        {
          packageDir: packageDirList,
          devDependencies: [
            "**/*.test.{js,jsx,ts,tsx,mts,cts}",
            "**/*.spec.{js,jsx,ts,tsx,mts,cts}",
            "**/*.vitest.{js,jsx,ts,tsx,mts,cts}",
            "**/__tests__/**",
          ],
          includeTypes: true,
          optionalDependencies: true,
          peerDependencies: true,
        },
      ],
    },
  },
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
