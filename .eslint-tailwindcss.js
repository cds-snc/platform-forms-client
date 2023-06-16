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
          "tailwindcss/classnames-order": "error",
          "tailwindcss/enforces-shorthand": "error",
        },
      },
    ],
    extends: [
      ".eslintrc.js",
    ],
    settings: {
      tailwindcss: {
        whitelist: ["(gc\\-).*"]
      }
    }
  };
  