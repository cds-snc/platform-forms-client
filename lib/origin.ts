import { headers } from "next/headers";

/**
 * Extract the origin from the request's headers.
 */
export async function getOrigin(): Promise<string> {
  const h = await headers();

  const detectedHost = h.get("host");
  const detectedProtocol = h.get("x-forwarded-proto") ?? "https";

  const url = new URL(`${detectedProtocol}://${detectedHost}`);

  // remove trailing slash
  const sanitizedUrl = url.toString().replace(/\/$/, "");

  return sanitizedUrl;
}

export async function isProductionEnvironment(): Promise<boolean> {
  const host = await getOrigin();
  return host.includes("forms-formulaires") && host.includes("canada.ca");
}
