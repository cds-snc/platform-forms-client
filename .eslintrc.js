module.exports = {
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: ["plugin:@typescript-eslint/recommended"],

      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      plugins: ["@typescript-eslint", "jsx-a11y", "prettier"],
      rules: {
        "@typescript-eslint/await-thenable": "error",
      },
    },
    {
      files: ["*.cy.{ts,tsx}", "cypress/**/*.{ts,tsx,js,jsx}", "cypress.config.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./cypress/tsconfig.json"],
      },
      extends: ["plugin:@typescript-eslint/recommended", "plugin:cypress/recommended"],
      plugins: ["@typescript-eslint", "prettier", "cypress"],
    },
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended",
    "plugin:@next/next/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react", "jsx-a11y", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "error",
    "no-await-in-loop": "error",
    "no-return-await": "error",
  },
};
