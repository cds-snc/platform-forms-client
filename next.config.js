const path = require("path");
const { i18n } = require("./next-i18next.config");

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  reactStrictMode: true,
  async redirects() {
    console.log(JSON.stringify(process.env));
    if (process.env.PRODUCTION_ENV) {
      return [
        {
          source: "/sandbox",
          destination: "/",
          permanent: false,
        },
      ];
    }
    return [];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    return config;
  },
};
