export default {
  //"*.ts(x)": "eslint -c .eslint-tailwindcss.js"
  "*.ts(x)": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.js(x)": ["eslint -c .eslintrc.js", "prettier --write"],
  "*.json": "prettier --write",
  "*.md": "prettier --write",
};
