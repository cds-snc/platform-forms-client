// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN =
  process.env.APP_ENV !== "test" && process.env.SENTRY_API_KEY
    ? "https://ab5e637912704c605108ca6573c95bf1@o4507865433767936.ingest.us.sentry.io/4507867500183552"
    : undefined;

Sentry.init({
  // Setting this to undefined will disable Sentry
  dsn: SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
