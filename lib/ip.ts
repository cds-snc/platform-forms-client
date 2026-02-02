import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { headers } from "next/headers";
import { logMessage } from "./logger";

const FALLBACK_CLIENT_IP_ADDRESS = "0.0.0.0";

export async function getClientIp(): Promise<string> {
  const head = await headers();

  // Run this new code passively to see how it behaves in Production
  newGetClientIp(head);

  const forwardedFor = head.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_CLIENT_IP_ADDRESS;
  }

  return head.get("x-real-ip") ?? FALLBACK_CLIENT_IP_ADDRESS;
}

function newGetClientIp(requestHeaders: ReadonlyHeaders): void {
  const xForwardedForHeader = requestHeaders.get("x-forwarded-for");

  if (xForwardedForHeader === null) {
    logMessage.info(
      `[debug][ip] xForwardedForHeader is null returning ${FALLBACK_CLIENT_IP_ADDRESS}`
    );
    return;
  }

  /**
   * Only consider last IP as the source of truth as it has been added by AWS ECS Load balancer
   * See https://docs.aws.amazon.com/elasticloadbalancing/latest/application/x-forwarded-headers.html#x-forwarded-for-append
   */
  logMessage.info(
    `[debug][ip] detected IP in ${xForwardedForHeader} = ${xForwardedForHeader.split(",").at(-1) ?? FALLBACK_CLIENT_IP_ADDRESS}`
  );
}
