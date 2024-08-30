import {withSentryConfig} from "@sentry/nextjs";
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
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  poweredByHeader: false,
  compiler: {
    // Remove all console.* calls
    // removeConsole: false,
  },
  output: isOutputStandalone ? "standalone" : undefined,
  ...(process.env.REVIEW_ENV && {
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
        source: "/:locale/form-builder/:id/responses",
        destination: "/:locale/form-builder/:id/responses/new",
        permanent: true,
      },
      {
        source: "/:locale/form-builder/edit",
        destination: "/:locale/form-builder/0000/edit",
        permanent: true,
      },
    ];
  },

  experimental: {
    instrumentationHook: true,
    // PPR is only supported in Next.js Canary branches
    // ppr: true,
    serverComponentsExternalPackages: ["@aws-sdk/lib-dynamodb", "pino"],
    serverActions: {
      bodySizeLimit: "5mb",
    },
    turbo: {
      rules: {
        "*.md": ["raw-loader"],
      },
    },
  },
};

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://github.com/getsentry/sentry-webpack-plugin#options

org: "canadian-digital-service-5g",
project: "gc-forms-nextjs",
authToken: process.env.SENTRY_API_KEY,

// Only print logs for uploading source maps in CI
silent: !process.env.CI,


// For all available options, see:
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// Upload a larger set of source maps for prettier stack traces (increases build time)
widenClientFileUpload: true,

// Automatically annotate React components to show their full name in breadcrumbs and session replay
reactComponentAnnotation: {
enabled: true,
},

// Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
// This can increase your server load as well as your hosting bill.
// Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
// side errors will fail.
tunnelRoute: "/monitoring",

// Hides source maps from generated client bundles
hideSourceMaps: true,

// Automatically tree-shake Sentry logger statements to reduce bundle size
disableLogger: true,

// Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
// See the following for more information:
// https://docs.sentry.io/product/crons/
// https://vercel.com/docs/cron-jobs
automaticVercelMonitors: true,
});