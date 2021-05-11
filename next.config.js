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
    isProduction: process.env.PRODUCTION_ENV === "true" ? true : false,
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
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    if (!options.isServer && config.mode === "development") {
      const { I18NextHMRPlugin } = require("i18next-hmr/plugin");
      config.plugins.push(
        new I18NextHMRPlugin({
          localesDir: path.resolve(__dirname, "public/static/locales"),
        })
      );
    }

    return config;
  },
};
