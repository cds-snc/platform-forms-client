import { headers } from "next/headers";

/**
 * Extract the origin from the request's headers.
 */
export function getOrigin(): string {
  const h = headers();

  const detectedHost = h.get("host");
  const detectedProtocol = h.get("x-forwarded-proto") ?? "https";

  const url = new URL(`${detectedProtocol}://${detectedHost}`);

  // remove trailing slash
  const sanitizedUrl = url.toString().replace(/\/$/, "");

  return sanitizedUrl;
}
