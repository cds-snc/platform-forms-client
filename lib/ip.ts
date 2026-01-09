import { headers } from "next/headers";

const FALLBACK_IP_ADDRESS = "0.0.0.0";

export async function getClientIP(): Promise<string> {
  const requestHeaders = await headers();

  const xForwardedForHeader = requestHeaders.get("x-forwarded-for");

  if (xForwardedForHeader !== null) {
    /**
     * Only consider last IP as the source of truth as it has been added by AWS ECS Load balancer
     * See https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html#x-forwarded-for-append
     */
    return xForwardedForHeader.split(",").at(-1) ?? FALLBACK_IP_ADDRESS;
  }

  return FALLBACK_IP_ADDRESS;
}
