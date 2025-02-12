import { headers } from "next/headers";

// See https://nextjs.org/docs/app/api-reference/functions/headers#ip-address
export async function getClientIP() {
  const FALLBACK_IP_ADDRESS = "0.0.0.0";
  const head = await headers();
  const forwardedFor = head.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0] ?? FALLBACK_IP_ADDRESS;
  }
  return head.get("x-real-ip") ?? FALLBACK_IP_ADDRESS;
}
