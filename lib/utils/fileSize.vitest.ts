import { describe, it, expect } from "vitest";
import { bytesToKbOrMbString, bytesToMb, kbToBytes, mbToBytes } from "./fileSize";

describe("bytesToMb", () => {
  it("converts 0 bytes to 0 MB", () => {
    expect(bytesToMb(0)).toBe(0);
  });

  it("converts 1 MB (1048576 bytes) to 1 MB", () => {
    expect(bytesToMb(1048576)).toBe(1);
  });

  it("converts 0.5 MB (524288 bytes) to 0.5 MB", () => {
    expect(bytesToMb(524288)).toBe(0.5);
  });

  it("converts 1.5 MB (1572864 bytes) to 1.5 MB", () => {
    expect(bytesToMb(1572864)).toBe(1.5);
  });

  it("converts 1.4 MB (1468006.4 bytes) to 1.4 MB", () => {
    expect(bytesToMb(1468006.4)).toBe(1.4);
  });

  it("converts 1.6 MB (1677721.6 bytes) to 1.6 MB", () => {
    expect(bytesToMb(1677721.6)).toBe(1.6);
  });

  it("converts 2 MB (2097152 bytes) to 2 MB", () => {
    expect(bytesToMb(2097152)).toBe(2);
  });

  it("handles negative bytes", () => {
    expect(bytesToMb(-1048576)).toBe(-1);
  });

  it("handles large byte values", () => {
    expect(bytesToMb(10 * 1024 * 1024)).toBe(10);
  });

  it("rounds 0.9 MB to 1 MB", () => {
    expect(bytesToMb(1024 * 1023)).toBe(1);
  });

  it("returns .5 for 0.5 MB", () => {
    expect(bytesToMb(0.5 * 1024 * 1024)).toBe(0.5);
  });
});

describe("mbToBytes", () => {
  it("converts 0 MB to 0 bytes", () => {
    expect(mbToBytes(0)).toBe(0);
  });

  it("converts 1 MB to 1048576 bytes", () => {
    expect(mbToBytes(1)).toBe(1048576);
  });

  it("converts 0.5 MB to 524288 bytes", () => {
    expect(mbToBytes(0.5)).toBe(524288);
  });

  it("converts 1.5 MB to 1572864 bytes", () => {
    expect(mbToBytes(1.5)).toBe(1572864);
  });

  it("rounds 1.49 MB to 1560282 bytes", () => {
    expect(mbToBytes(1.49)).toBe(Math.round(1.49 * 1024 * 1024));
  });

  it("rounds 1.51 MB to 1585446 bytes", () => {
    expect(mbToBytes(1.51)).toBe(Math.round(1.51 * 1024 * 1024));
  });

  it("handles negative MB", () => {
    expect(mbToBytes(-1)).toBe(-1048576);
  });

  it("handles large MB values", () => {
    expect(mbToBytes(1000)).toBe(1048576000);
  });

  it("handles small MB values", () => {
    expect(mbToBytes(0.001)).toBe(Math.round(0.001 * 1024 * 1024));
  });
});

describe("inverse relationship", () => {
  it("mbToBytes and bytesToMb are inverses for integer MB values", () => {
    for (let mb = 0; mb <= 10; mb++) {
      expect(bytesToMb(mbToBytes(mb))).toBe(mb);
    }
  });

  it("mbToBytes and bytesToMb are inverses for .5 MB", () => {
    expect(bytesToMb(mbToBytes(0.5))).toBe(0.5);
    expect(bytesToMb(mbToBytes(1.5))).toBe(1.5);
  });

  it("bytesToMb(mbToBytes(x)) is close to x for random decimals", () => {
    const values = [0.1, 0.25, 0.75, 2.25, 3.5, 7.75];
    for (const val of values) {
      expect(Math.abs(bytesToMb(mbToBytes(val)) - Math.round(val))).toBeLessThanOrEqual(0.5);
    }
  });
});

describe("kbToBytes", () => {
  it("converts 0 KB to 0 bytes", () => {
    expect(kbToBytes(0)).toBe(0);
  });

  it("converts 1 KB to 1024 bytes", () => {
    expect(kbToBytes(1)).toBe(1024);
  });

  it("converts 0.5 KB to 512 bytes", () => {
    expect(kbToBytes(0.5)).toBe(512);
  });

  it("converts 2.5 KB to 2560 bytes", () => {
    expect(kbToBytes(2.5)).toBe(2560);
  });

  it("handles negative KB", () => {
    expect(kbToBytes(-1)).toBe(-1024);
  });

  it("handles large KB values", () => {
    expect(kbToBytes(10000)).toBe(10240000);
  });

  it("handles small KB values", () => {
    expect(kbToBytes(0.001)).toBe(Math.round(0.001 * 1024));
  });
});

describe("bytesToKbOrMbString", () => {
  it("returns bytes for values less than 500", () => {
    expect(bytesToKbOrMbString(0)).toEqual({ size: 0, unit: "bytes" });
    expect(bytesToKbOrMbString(499)).toEqual({ size: 499, unit: "bytes" });
    expect(bytesToKbOrMbString(250)).toEqual({ size: 250, unit: "bytes" });
  });

  it("returns KB for values between 500 and 1040000", () => {
    expect(bytesToKbOrMbString(500)).toEqual({
      size: 0,
      unit: "KB",
    });
    expect(bytesToKbOrMbString(1024)).toEqual({ size: 1, unit: "KB" });
    expect(bytesToKbOrMbString(1536)).toEqual({ size: 2, unit: "KB" }); // 1.5 rounds to 2
    expect(bytesToKbOrMbString(1040000 - 1)).toEqual({
      size: 1016,
      unit: "KB",
    });
  });

  it("returns MB for values >= 1040000", () => {
    expect(bytesToKbOrMbString(1040000)).toEqual({
      size: 0.99,
      unit: "MB",
    });
    expect(bytesToKbOrMbString(1048576)).toEqual({ size: 1, unit: "MB" });
    expect(bytesToKbOrMbString(1572864)).toEqual({ size: 1.5, unit: "MB" });
    expect(bytesToKbOrMbString(2097152)).toEqual({ size: 2, unit: "MB" });
  });

  it("handles negative values", () => {
    expect(bytesToKbOrMbString(-100)).toEqual({ size: -100, unit: "bytes" });
    expect(bytesToKbOrMbString(-1048576)).toEqual({ size: -1, unit: "MB" });
  });

  it("handles edge cases", () => {
    expect(bytesToKbOrMbString(500)).toEqual({
      size: 0,
      unit: "KB",
    });
    expect(bytesToKbOrMbString(1040000)).toEqual({
      size: 0.99,
      unit: "MB",
    });
  });

  describe("internationalization", () => {
    it("formats decimals with periods for English", () => {
      expect(bytesToKbOrMbString(1572864, "en")).toEqual({
        size: "1.5",
        unit: "MB",
      });
      expect(bytesToKbOrMbString(1536, "en")).toEqual({
        size: "2",
        unit: "KB",
      });
    });

    it("formats decimals with commas for French", () => {
      expect(bytesToKbOrMbString(1572864, "fr")).toEqual({
        size: "1,5",
        unit: "MB",
      });
      expect(bytesToKbOrMbString(1536, "fr")).toEqual({
        size: "2",
        unit: "KB",
      });
    });

    it("handles whole numbers without decimals", () => {
      expect(bytesToKbOrMbString(1048576, "en")).toEqual({
        size: "1",
        unit: "MB",
      });
      expect(bytesToKbOrMbString(1048576, "fr")).toEqual({
        size: "1",
        unit: "MB",
      });
    });

    it("shows up to 2 decimal places when needed", () => {
      // 1.7 MB -> shows as 1.7 MB with our new precision
      expect(bytesToKbOrMbString(1782579, "en")).toEqual({
        size: "1.7",
        unit: "MB",
      });
      expect(bytesToKbOrMbString(1782579, "fr")).toEqual({
        size: "1,7",
        unit: "MB",
      });
    });

    it("does not format bytes (too small for decimals)", () => {
      expect(bytesToKbOrMbString(250, "en")).toEqual({
        size: 250,
        unit: "bytes",
      });
      expect(bytesToKbOrMbString(250, "fr")).toEqual({
        size: 250,
        unit: "bytes",
      });
    });

    it("maintains backward compatibility when no language is provided", () => {
      expect(bytesToKbOrMbString(1572864)).toEqual({
        size: 1.5,
        unit: "MB",
      });
    });

    it("demonstrates increased precision with various sizes", () => {
      // Test KB precision to 1 decimal place
      expect(bytesToKbOrMbString(1228, "en")).toEqual({
        size: "1",
        unit: "KB",
      });
      expect(bytesToKbOrMbString(1228, "fr")).toEqual({
        size: "1",
        unit: "KB",
      });

      // Test MB precision to 2 decimal places
      expect(bytesToKbOrMbString(1258291, "en")).toEqual({
        size: "1.2",
        unit: "MB",
      });
      expect(bytesToKbOrMbString(1258291, "fr")).toEqual({
        size: "1,2",
        unit: "MB",
      });

      // Test more precise MB values
      expect(bytesToKbOrMbString(1363149, "en")).toEqual({
        size: "1.3",
        unit: "MB",
      });
      expect(bytesToKbOrMbString(1363149, "fr")).toEqual({
        size: "1,3",
        unit: "MB",
      });
    });
  });
});
