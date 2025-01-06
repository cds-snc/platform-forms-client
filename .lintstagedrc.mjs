export default {
  "!(*test).{ts,tsx,js,jsx}": ["eslint --config eslint.config.mjs", "prettier --write"],
  "*.json": "prettier --write",
  "*.md": "prettier --write",
};
