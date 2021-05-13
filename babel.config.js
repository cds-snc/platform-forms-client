module.exports = {
  presets: ["next/babel"],
  env: {
    test: {
      plugins: ["transform-require-context"],
    },
  },
  overrides: [
    {
      test: ["./node_modules/pino"],
      presets: [["@babel/preset-env", { targets: { ie: "11" } }]],
    },
  ],
};
