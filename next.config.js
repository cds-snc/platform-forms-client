const path = require("path");
const { i18n } = require("./next-i18next.config");

const isOutputStandalone = process.env.NEXT_OUTPUT_STANDALONE === "true";
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
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Permissions-Policy",
    value: "browsing-topics=()",
  },
];

module.exports = {
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  swcMinify: true,
  compiler: {
    // Remove all console.* calls
    removeConsole: true,
  },
  output: isOutputStandalone ? "standalone" : undefined,
  webpack: (config) => {
    // Support reading markdown
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });

    // Load version file
    config.module.rules.push({
      test: /VERSION$/,
      type: "asset/source",
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
