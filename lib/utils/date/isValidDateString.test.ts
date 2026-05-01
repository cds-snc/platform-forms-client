import { describe, it, expect } from "vitest";
import { isValidDateString } from "./isValidDateString";

describe("isValidDateString", () => {
  it("should return true for a valid date", () => {
    const date = "2023-10-01T12:00:00Z";
    const result = isValidDateString(date);
    expect(result).toBe(true);
  });

  it("should return true for a valid date", () => {
    const date = "2023-10-10";
    const result = isValidDateString(date);
    expect(result).toBe(true);
  });

  it("should return false for an invalid date", () => {
    const date = undefined;
    // @ts-expect-error - testing invalid input
    const result = isValidDateString(date);
    expect(result).toBe(false);
  });

  it("should return false for an invalid date", () => {
    const date = "";
    const result = isValidDateString(date);
    expect(result).toBe(false);
  });

  it("should return false for an invalid date", () => {
    const date = "invalid-date";
    const result = isValidDateString(date);
    expect(result).toBe(false);
  });

  it("should return false for an invalid date", () => {
    const date = "11-11-2011 invalid";
    const result = isValidDateString(date);
    expect(result).toBe(false);
  });
});
