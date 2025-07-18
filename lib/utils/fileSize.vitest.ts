import { describe, it, expect } from "vitest";
import { bytesToKbOrMbString, bytesToMb, fileSizeWithBase64Overhead, kbToBytes, mbToBytes } from "./fileSize";

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

  it("rounds 1.4 MB (1468006.4 bytes) to 1.5 MB", () => {
    expect(bytesToMb(1468006.4)).toBe(1.5);
  });

  it("rounds 1.6 MB (1677721.6 bytes) to 1.5 MB", () => {
    expect(bytesToMb(1677721.6)).toBe(1.5);
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
    expect(bytesToKbOrMbString(500)).toEqual({ size: Math.round((500 / 1024) * 2) / 2, unit: "KB" });
    expect(bytesToKbOrMbString(1024)).toEqual({ size: 1, unit: "KB" });
    expect(bytesToKbOrMbString(1536)).toEqual({ size: 1.5, unit: "KB" });
    expect(bytesToKbOrMbString(1040000 - 1)).toEqual({ size: Math.round(((1040000 - 1) / 1024) * 2) / 2, unit: "KB" });
  });

  it("returns MB for values >= 1040000", () => {
    expect(bytesToKbOrMbString(1040000)).toEqual({ size: Math.round((1040000 / 1048576) * 2) / 2, unit: "MB" });
    expect(bytesToKbOrMbString(1048576)).toEqual({ size: 1, unit: "MB" });
    expect(bytesToKbOrMbString(1572864)).toEqual({ size: 1.5, unit: "MB" });
    expect(bytesToKbOrMbString(2097152)).toEqual({ size: 2, unit: "MB" });
  });

  it("handles negative values", () => {
    expect(bytesToKbOrMbString(-100)).toEqual({ size: -100, unit: "bytes" });
    expect(bytesToKbOrMbString(-1048576)).toEqual({ size: -1, unit: "MB" });
  });

  it("handles edge cases", () => {
    expect(bytesToKbOrMbString(500)).toEqual({ size: Math.round((500 / 1024) * 2) / 2, unit: "KB" });
    expect(bytesToKbOrMbString(1040000)).toEqual({ size: Math.round((1040000 / 1048576) * 2) / 2, unit: "MB" });
  });
});

describe("fileSizeWithBase64Overhead", () => {
  it("returns 0 for 0 bytes", () => {
    expect(fileSizeWithBase64Overhead(0)).toBe(0);
  });

  it("calculates base64 overhead for small files", () => {
    expect(fileSizeWithBase64Overhead(1000)).toBe(Math.round(1000 * 1.35));
    expect(fileSizeWithBase64Overhead(500)).toBe(Math.round(500 * 1.35));
  });

  it("calculates base64 overhead for large files", () => {
    expect(fileSizeWithBase64Overhead(1048576)).toBe(Math.round(1048576 * 1.35));
    expect(fileSizeWithBase64Overhead(10000000)).toBe(Math.round(10000000 * 1.35));
  });

  it("handles negative values", () => {
    expect(fileSizeWithBase64Overhead(-1000)).toBe(Math.round(-1000 * 1.35));
  });

  it("returns integer values (rounded)", () => {
    const result = fileSizeWithBase64Overhead(1234);
    expect(Number.isInteger(result)).toBe(true);
  });
});