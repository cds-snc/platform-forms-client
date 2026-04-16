import { headers } from "next/headers";

const FALLBACK_CLIENT_IP_ADDRESS = "0.0.0.0";

export async function getClientIp(): Promise<string> {
  const requestHeaders = await headers();

  const xForwardedForHeader = requestHeaders.get("x-forwarded-for");

  if (xForwardedForHeader === null) {
    return FALLBACK_CLIENT_IP_ADDRESS;
  }

  /**
   * Only consider last IP as the source of truth as it has been added by AWS ECS Load balancer
   * See https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html#x-forwarded-for-append
   */
  return xForwardedForHeader.split(",").at(-1)?.trim() ?? FALLBACK_CLIENT_IP_ADDRESS;
}
