/** @type {import('next').NextConfig} */

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
];

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  poweredByHeader: false,
  compiler: {
    // Remove all console.* calls
    removeConsole: true,
  },
  output: isOutputStandalone ? "standalone" : undefined,
  webpack: (config, { isServer, nextRuntime, webpack }) => {
    // Support reading markdown
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });

    // Silences a repeated warning from the aws-sdk
    if (isServer && nextRuntime === "nodejs")
      config.plugins.push(new webpack.IgnorePlugin({ resourceRegExp: /^aws-crt$/ }));

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
  experimental: {
    instrumentationHook: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
