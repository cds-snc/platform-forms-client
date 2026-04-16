import { describe, it, expect } from "vitest";
import { estToUtc } from "./estToUtc";

describe("estToUtc", () => {
  describe("EST (Standard Time, UTC-5)", () => {
    it("should convert Eastern Standard Time to UTC", () => {
      // January 15, 2026 at 15:00 EST should be 20:00 UTC
      const timestamp = estToUtc(2026, 1, 15, 15, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-01-15T20:00:00.000Z");
    });

    it("should handle midnight EST correctly", () => {
      // February 1, 2026 at 00:00 EST should be 05:00 UTC
      const timestamp = estToUtc(2026, 2, 1, 0, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-02-01T05:00:00.000Z");
    });

    it("should handle late evening EST correctly (date rollover)", () => {
      // February 4, 2026 at 22:30 EST should be February 5, 2026 at 03:30 UTC
      const timestamp = estToUtc(2026, 2, 4, 22, 30);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-02-05T03:30:00.000Z");
    });
  });

  describe("EDT (Daylight Saving Time, UTC-4)", () => {
    it("should convert Eastern Daylight Time to UTC", () => {
      // July 15, 2026 at 15:00 EDT should be 19:00 UTC
      const timestamp = estToUtc(2026, 7, 15, 15, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-07-15T19:00:00.000Z");
    });

    it("should handle midnight EDT correctly", () => {
      // August 1, 2026 at 00:00 EDT should be 04:00 UTC
      const timestamp = estToUtc(2026, 8, 1, 0, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-08-01T04:00:00.000Z");
    });
  });

  describe("DST transition edge cases", () => {
    it("should handle date just before spring forward (March 8, 2026)", () => {
      // March 7, 2026 at 23:00 EST should be March 8, 2026 at 04:00 UTC
      const timestamp = estToUtc(2026, 3, 7, 23, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-03-08T04:00:00.000Z");
    });

    it("should handle date just after spring forward (March 8, 2026)", () => {
      // DST starts at 2:00 AM EST - clocks spring forward to 3:00 AM EDT
      // 3:00 AM on March 8 is EDT (UTC-4)
      // 3:00 EDT = 07:00 UTC
      const timestamp = estToUtc(2026, 3, 8, 3, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-03-08T07:00:00.000Z");
    });

    it("should handle date just before fall back (November 1, 2026)", () => {
      // October 31, 2026 at 23:00 EDT should be November 1, 2026 at 03:00 UTC
      const timestamp = estToUtc(2026, 10, 31, 23, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-11-01T03:00:00.000Z");
    });

    it("should handle date just after fall back (November 1, 2026)", () => {
      // DST ends at 2:00 AM EDT - clocks fall back to 1:00 AM EST
      // 3:00 AM on November 1 is EST (UTC-5) - after the transition
      // 3:00 EST = 08:00 UTC
      const timestamp = estToUtc(2026, 11, 1, 3, 0);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-11-01T08:00:00.000Z");
    });
  });

  describe("minutes handling", () => {
    it("should correctly handle non-zero minutes", () => {
      // January 15, 2026 at 14:37 EST should be 19:37 UTC
      const timestamp = estToUtc(2026, 1, 15, 14, 37);
      const result = new Date(timestamp);

      expect(result.toISOString()).toBe("2026-01-15T19:37:00.000Z");
    });
  });
});
