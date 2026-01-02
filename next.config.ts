import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  reactCompiler: {
    compilationMode: "annotation",
  },
  sassOptions: {
    includePaths: ["./styles"],
  },
  poweredByHeader: false,
  compiler: {
    // Remove all console.* calls
    // removeConsole: false,
  },
  output: process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,
  ...(process.env.LAMBDA_ENV && {
    cacheHandler: "./nextCacheHandler.ts",
    cacheMaxMemorySize: 0, // disable default in-memory caching
  }),
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: "/:path*",
        headers: [
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
        ],
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
  serverExternalPackages: ["@aws-sdk/lib-dynamodb", "pino", "@opentelemetry/sdk-node"],
  experimental: {
    serverActions: {
      // Note: this matches values in constants.ts
      bodySizeLimit: "10mb",
    },
    viewTransition: true,
  },
  typedRoutes: true,
  turbopack: {
    rules: {
      "*.md": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
