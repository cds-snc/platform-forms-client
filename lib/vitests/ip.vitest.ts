import { describe, it, expect } from "vitest";
import { allowIp, isIpInRange } from "../ip";

describe("isIpInRange function", () => {
  const ipAndRangesList = [
    {
      ip: "130.150.1.1",
      range: "130.150.0.0/16",
      expected: true,
    },
    {
      ip: "130.160.1.1",
      range: "130.150.0.0/16",
      expected: false,
    },
    {
      ip: "130.100.60.1",
      range: "130.100.60.0/18",
      expected: true,
    },
    {
      ip: "130.100.70.1",
      range: "130.100.60.0/18",
      expected: false,
    },
    {
      ip: "160.100.60.1",
      range: "160.100.60.0/19",
      expected: true,
    },
    {
      ip: "160.100.70.1",
      range: "160.100.60.0/19",
      expected: false,
    },
    {
      ip: "160.100.100.1",
      range: "160.100.100.0/20",
      expected: true,
    },
    {
      ip: "160.100.200.1",
      range: "160.100.100.0/20",
      expected: false,
    }
  ];

  ipAndRangesList.forEach(({ ip, range, expected }) => {
    it(`should return ${expected} for IP ${ip} in range ${range}`, () => {
      expect(isIpInRange(ip, range)).toBe(expected);
    });
  });
});

describe("allowIp function", () => {
  const ipRangeAllowList = "130.150.0.0/16,130.100.60.0/18,160.100.60.0/19,160.100.100.0/20,192.168.1.0/24";
  it("finds an IP in range of the allow list", () => {
    expect(allowIp("130.150.1.1", ipRangeAllowList)).toBe(true);
  });

  it("does not find an IP out of range of the allow list", () => {
    expect(allowIp("130.160.1.1", ipRangeAllowList)).toBe(false);
  });
});
