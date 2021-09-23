const path = require("path");
const { i18n } = require("./next-i18next.config");
const localesDir = path.resolve("public/static/locales");

let prod = process.env.NODE_ENV == "production";

let csp = ``;
csp += `base-uri 'self';`;
csp += `form-action 'self';`;
csp += `default-src 'self';`;
csp += `script-src 'self' ${prod ? "" : "'unsafe-eval'"};`; // NextJS requires 'unsafe-eval' in dev (faster source maps)
csp += `style-src 'self' https://fonts.googleapis.com 'unsafe-inline' data:;`; // NextJS requires 'unsafe-inline'
csp += `img-src 'self' https: data:;`;
csp += `font-src 'self' https://fonts.gstatic.com;`;
csp += `frame-src https://www.googletagmanager.com;`;

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Content-Security-Policy",
    value: csp,
  },
];

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
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
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
