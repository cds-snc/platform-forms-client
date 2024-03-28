export default {
  //"*.{ts,tsx}": "eslint -c .eslint-tailwindcss.js"
  "!(*test).{ts,tsx,js,jsx}": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.json": "prettier --write",
  "*.md": "prettier --write",
};
