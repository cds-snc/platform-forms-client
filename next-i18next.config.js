const path = require("path");
const HttpBackend = require("i18next-http-backend/cjs");
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
  },
  localePath: path.resolve("./public/static/locales"),
  react: {
    useSuspense: false,
  },
  use: process.browser ? [HttpBackend] : [],
};
