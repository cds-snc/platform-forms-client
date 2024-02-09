export default {
  //"*.ts(x)": "eslint -c .eslint-tailwindcss.js"
  "*.ts": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.tsx": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.js": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.jsx": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.json": "prettier --write",
  "*.md": "prettier --write",
};
