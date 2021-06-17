const path = require("path");
const { I18NextHMRPlugin } = require("i18next-hmr/plugin");
const { i18n } = require("./next-i18next.config");

const localesDir = path.resolve("public/static/locales");

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  reactStrictMode: true,
  webpack: (config, context) => {
    // Allow for hot reload of translations
    if (!context.isServer && context.dev) {
      config.plugins.push(new I18NextHMRPlugin({ localesDir }));
    }

    // Support reading markdown
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    // Load version file
    config.module.rules.push({
      test: /VERSION/,
      use: "raw-loader",
    });

    // The pino logger module is transpiled for IE11 via babel.config.js
    config.module.rules.push({
      test: /\.js$/,
      exclude: (file) => /node_modules/.test(file) && !/pino/.test(file),
      use: [{ loader: "babel-loader" }],
    });
    return config;
  },
};
