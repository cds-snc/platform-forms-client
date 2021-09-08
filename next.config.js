const path = require("path");
const { i18n } = require("./next-i18next.config");
const localesDir = path.resolve("public/static/locales");

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles"), path.resolve("node_modules")],
  },
  reactStrictMode: true,
  webpack: (config, context) => {
    // Allow for hot reload of translations
    if (!context.isServer && context.dev) {
      const { I18NextHMRPlugin } = require("i18next-hmr/plugin");
      config.plugins.push(new I18NextHMRPlugin({ localesDir }));
    }

    // Needed because webpack is trying to include ioredis in broswer side
    // Will need to look at refactoring dataLayer between client and server side invocations.
    // Once refactored this can be removed.
    if (!context.isServer) {
      config.resolve.fallback.dns = false;
      config.resolve.fallback.net = false;
      config.resolve.fallback.tls = false;
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
