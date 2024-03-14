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
    // removeConsole: false,
  },
  output: isOutputStandalone ? "standalone" : undefined,
  webpack: (config) => {
    // Support reading markdown
    config.module.rules.push({
      test: /\.md$/,
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

  async redirects() {
    return [
      {
        source: "/:locale/form-builder/support",
        destination: "/:locale/support",
        permanent: true,
      },
      {
        source: "/:locale/form-builder/support/contactus",
        destination: "/:locale/contact",
        permanent: true,
      },
      {
        source: "/:locale/form-builder/:id/responses",
        destination: "/:locale/form-builder/:id/responses/new",
        permanent: true,
      },
    ];
  },

  experimental: {
    instrumentationHook: true,
    // ppr: true, -- This is not yet ready for production use
    serverComponentsExternalPackages: ["@aws-sdk/lib-dynamodb"],
  },
};

export default nextConfig;
