module.exports = {
  overrides: [
    {
      files: ["*.{ts,tsx}"],
      extends: ["plugin:tailwindcss/recommended"],

      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./tsconfig.json", "./cypress/tsconfig.json"],
      },
      plugins: ["eslint-plugin-tailwindcss"],
    },
  ],
  extends: [".eslintrc.js"],
  settings: {
    tailwindcss: {
      whitelist: [
        "(gc\\-).*",
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
        "confirmation",
      ],
    },
  },
};
