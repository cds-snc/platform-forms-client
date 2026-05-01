import { describe, it, expect } from 'vitest';
import { isValidISODate } from './isValidISODate';

describe("isValidISODate", () => {
  it("should return true for a valid ISO date", () => {
    const date = "2025-11-01T20:16:00.000Z"
    const result = isValidISODate(date);
    expect(result).toBe(true);
  });

  it("should return false for an invalid ISO date", () => { 
    const date = "Mon Nov 04 2024 08:52:12 GMT-0500 (Eastern Standard Time)";
    const result = isValidISODate(date);
    expect(result).toBe(false);
  });

  it("should return false for an invalid ISO date", () => { 
    const date = new Date();
    // @ts-expect-error - testing invalid input
    const result = isValidISODate(date);
    expect(result).toBe(false);
  });

  it("should return false for an invalid ISO date", () => { 
    const date = undefined;
    // @ts-expect-error - testing invalid input
    const result = isValidISODate(date);
    expect(result).toBe(false);
  });
});
