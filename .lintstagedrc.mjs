export default {
  //"*.{ts,tsx}": "eslint -c .eslint-tailwindcss.js"
  "!(*test).{ts,tsx,js,jsx}": ["eslint -c eslint.config.mjs", "prettier --write"],
  "*.json": "prettier --write",
  "*.md": "prettier --write",
};
