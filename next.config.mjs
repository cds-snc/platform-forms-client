/** @type {import('next').NextConfig} */

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "node:module";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);

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
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  poweredByHeader: false,
  compiler: {
    // Remove all console.* calls
    // removeConsole: false,
  },
  output: isOutputStandalone ? "standalone" : undefined,
  ...(process.env.LAMBDA_ENV && {
    cacheHandler: require.resolve("./nextCacheHandler.mjs"),
    cacheMaxMemorySize: 0, // disable default in-memory caching
  }),
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
        source: "/:locale/form-builder/edit",
        destination: "/:locale/form-builder/0000/edit",
        permanent: true,
      },
    ];
  },
  serverExternalPackages: ["@aws-sdk/lib-dynamodb", "pino"],
  experimental: {
    // PPR is only supported in Next.js Canary branches
    // ppr: true,
    serverActions: {
      // Note: this matches values in constants.ts
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    rules: {
      "*.md": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  }
};

export default nextConfig;
