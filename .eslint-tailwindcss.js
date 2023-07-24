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
    extends: [
      ".eslintrc.js",
    ],
    settings: {
      tailwindcss: {
        whitelist: ["(gc\\-).*", "form-builder", "page-container", "visually-hidden"]
      }
    }
  };
  