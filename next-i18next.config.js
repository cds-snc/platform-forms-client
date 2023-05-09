const path = require("path");
module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
  },
  returnNull: false,
  localePath: path.resolve("./public/static/locales"),
  ...(process.env.NODE_ENV !== "production" && { reloadOnPrerender: true }),
};
