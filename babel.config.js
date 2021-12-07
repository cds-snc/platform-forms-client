module.exports = {
  presets: ["next/babel"],
  plugins: ["@emotion"],
  env: {
    test: {
      plugins: ["transform-require-context"],
    },
  },
  overrides: [
    {
      test: ["./node_modules/pino"],
      presets: [["@babel/preset-env", { targets: { ie: "11" } }], "@babel/preset-typescript"],
    },
  ],
};
