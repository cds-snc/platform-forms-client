module.exports = {
  presets: ["next/babel"],
  plugins: ["@emotion"],
  env: {
    test: {
      plugins: ["transform-require-context", "dynamic-import-node"],
    },
  },
  overrides: [
    {
      test: ["./node_modules/pino"],
      presets: [["@babel/preset-env", { targets: { ie: "11" } }], "@babel/preset-typescript"],
    },
  ],
};
