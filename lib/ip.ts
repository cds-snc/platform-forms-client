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

// Creates a bitmask for use with a CIDR range
// Example: bits = 16 -> 11111111.11111111.00000000.00000000
const cidrMask = (bits: number): number => {
  if (bits === 0) return 0;
  return ((Math.pow(2, bits) - 1) << (32 - bits)) >>> 0;
};

// Convert IPs to 32-bit numbers
const ipToInt = (ipList: string): number => {
  return ipList
    .split(".")
    .map(Number)
    .reduce((accumulator, octet) => (accumulator << 8) + octet, 0);
};

// Checks if an IPv4 address is in a given IPv4 CIDR (Classless Inter-Domain Routing) range
export const isIpInRange = (ip: string, range: string): boolean => {
  // Split IP range
  const [rangeIp, prefixLengthStr] = range.split("/");
  const prefixLength = parseInt(prefixLengthStr, 10);

  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(rangeIp);
  const mask = cidrMask(prefixLength);

  // Compare masked values by taking a bitwise AND to compare IP bits to
  // the network portion of the range
  return (ipInt & mask) === (rangeInt & mask);
};

export const allowIp = (clientIp: string, ipAllowList: string) => {
  if (!clientIp || !ipAllowList) {
    return false;
  }

  // Handle IPv4-mapped IPv6 addresses
  const ipV4 = clientIp.replace(/^::ffff:/, "");

  const ipRanges = ipAllowList.split(",").map((range) => range.trim());

  // Check if client IP is in any of the allowed ranges, if so allow it
  for (const range of ipRanges) {
    if (isIpInRange(ipV4, range)) {
      return true;
    }
  }

  // Client IP not in any allowed range, deny it
  return false;
};
