module.exports = {
    overrides: [
      {
        files: ["*.{ts,tsx}"],
        extends: ["plugin:tailwindcss/recommended"],
  
        parser: "@typescript-eslint/parser",
        parserOptions: {
          project: ["./tsconfig.json"],
        },
        plugins: ["eslint-plugin-tailwindcss"],
        rules: {
          "@typescript-eslint/await-thenable": "error",
        },
      },
    ],
    extends: [
      ".eslintrc.js",
    ],
  };
  