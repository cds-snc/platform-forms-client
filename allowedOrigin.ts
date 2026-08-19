// Strip trailing slashes from HOST_URL to avoid issues with CORS and other origin checks.
export const allowedOrigin = process.env.HOST_URL?.trim().replace(/\/+$/, "");
