import { headers } from "next/headers";

/**
 * Extract the origin from either `AUTH_URL` or `NEXTAUTH_URL` environment variables,
 * or the request's headers option.
 */
export function getOrigin(): string {
  const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  const h = headers();

  let url: URL;
  if (envUrl) {
    url = new URL(envUrl);
  } else {
    const detectedHost = h.get("x-forwarded-host") ?? h.get("host");
    const detectedProtocol = h.get("x-forwarded-proto") ?? "https";

    url = new URL(`${detectedProtocol}://${detectedHost}`);
  }

  // remove trailing slash
  const sanitizedUrl = url.toString().replace(/\/$/, "");

  return sanitizedUrl;
}
