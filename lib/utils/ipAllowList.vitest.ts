import { describe, it, expect } from "vitest";
import { isIpInRange } from "./ipAllowList";

describe("IP Range", () => {
  const testIpAndRanges = [
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

  testIpAndRanges.forEach(({ ip, range, expected }) => {
    it(`should return ${expected} for IP ${ip} in range ${range}`, () => {
      expect(isIpInRange(ip, range)).toBe(expected);
    });
  });
});
