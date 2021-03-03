const path = require("path");
const i18nSettings = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
  },
  localePath: path.resolve("./public/static/locales"),
};

if (process.env.NODE_ENV !== "production") {
  if (process.browser) {
    const { applyClientHMR } = require("i18next-hmr/client");
    applyClientHMR(i18nSettings.i18n);
  } else {
    const { applyServerHMR } = require("i18next-hmr/server");
    applyServerHMR(i18nSettings.i18n);
  }
}

module.exports = i18nSettings;
