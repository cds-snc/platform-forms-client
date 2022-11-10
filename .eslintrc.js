module.exports = {
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:jsx-a11y/recommended",
        "plugin:prettier/recommended",
        "prettier",
      ],

      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
      plugins: ["@typescript-eslint", "jsx-a11y", "prettier"],
      rules: {
        "@typescript-eslint/await-thenable": "error",
        "jsx-a11y/anchor-is-valid": [
          "error",
          {
            components: ["Link"],
            specialLink: ["hrefLeft", "hrefRight"],
            aspects: ["invalidHref", "preferButton"],
          },
        ],
      },
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
    "plugin:jsx-a11y/recommended",
    "plugin:cypress/recommended",
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
  plugins: ["react", "jsx-a11y", "prettier", "cypress"],
  rules: {
    "prettier/prettier": "error",
    "no-console": "error",
    "no-await-in-loop": "error",
  },
};
