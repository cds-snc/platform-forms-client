const path = require("path");

module.exports = {
  core: {
    builder: "webpack5",
  },
  stories: ["../**/*.stories.mdx", "../**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-a11y"],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.scss$/,
      use: [
        "style-loader",
        "css-loader",
        "postcss-loader",
        // Add the sass loader to process scss files
        "sass-loader",
      ],
    });
    config.resolve.alias = {...config.resolve.alias, "@lib": path.resolve(__dirname, "../lib")}
    config.resolve.alias = {...config.resolve.alias, "@components": path.resolve(__dirname, "../components")}

    config.resolve.alias = {
      ...config.resolve.alias,
      "next-i18next": "react-i18next",
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      dns: false,
      tls: false,
      net: false,
      stream: false,
    };

    return config;
  },
};
