const path = require("path");
const { i18n } = require("./next-i18next.config");

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  reactStrictMode: true,
  publicRuntimeConfig: {
    // Will be available on both server and client
    isProduction:
      process.env.PRODUCTION_ENV === "true" ? true : false,
  },
  async redirects() {
    if (process.env.PRODUCTION_ENV === "true") {
      return [
        {
          source: "/sandbox",
          destination: "/welcome-bienvenue",
          permanent: true,
        },
      ];
    } else {
      return [];
    }
  },
  webpack: (config) => {
    // Support reading markdown
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    // The pino logger module is transpiled for IE11 via babel.config.js
    config.module.rules.push({
      test: /\.js$/,
      exclude: (file) =>
        /node_modules/.test(file) && !/pino/.test(file),
      use: [{ loader: "babel-loader" }],
    });
    return config;
  },
};
