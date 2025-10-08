// Checks if an IPv4 address is in a given IPv4 range (CIDR)
export const isIpInRange = (ip: string, range: string): boolean => {
  // Split IP range
  const [rangeIp, prefixLengthStr] = range.split("/");
  const prefixLength = parseInt(prefixLengthStr, 10);

  // Convert IPs to 32-bit numbers
  function ipToInt(ipStr: string): number {
    return ipStr
      .split(".")
      .map(Number)
      .reduce((acc, octet) => (acc << 8) + octet, 0);
  }

  const ipInt = ipToInt(ip);
  const rangeInt = ipToInt(rangeIp);

  // Calculate mask
  // Something like this also work but can run into weird JS errors: 0 ? 0 : (~0 << (32 - prefixLength)) >>> 0;
  const mask = prefixLength === 0 ? 0 : (0xffffffff << (32 - prefixLength)) >>> 0;

  // Compare masked values
  return (ipInt & mask) === (rangeInt & mask);
};

export const allowIp = (clientIp: string, ipAllowList: string) => {
  // const ipAllowList = process.env.IP_ALLOW_LIST;

  if (!clientIp || !ipAllowList) {
    return false;
  }

  const ipRanges = ipAllowList.split(",").map((range) => range.trim());

  // Check if client IP is in any of the allowed ranges
  for (const range of ipRanges) {
    if (isIpInRange(clientIp, range)) {
      return true;
    }
  }

  // Client IP not in any allowed range, deny access
  return false;
};
