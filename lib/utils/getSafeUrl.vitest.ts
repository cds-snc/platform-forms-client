import { describe, it, expect } from "vitest";
import { getSafeUrl } from "./getSafeUrl";

describe("getSafeUrl", () => {
  it("should return a valid URL with http protocol", () => {
    const url = "http://example.com";
    const result = getSafeUrl(url);
    expect(result).toBe(url);
  });

  it("should return a valid URL with https protocol", () => {
    const url = "https://example.com";
    const result = getSafeUrl(url);
    expect(result).toBe(url);
  });

  it("should return null for invalid URLs", () => {
    const url = "ftp://example.com";
    const result = getSafeUrl(url);
    expect(result).toBeNull();
  });

  it("should return null for malformed URLs", () => {
    const url = "htp://example.com";
    const result = getSafeUrl(url);
    expect(result).toBeNull();
  });

  it("should return null for empty strings", () => {
    const url = "";
    const result = getSafeUrl(url);
    expect(result).toBeNull();
  });

  it("should trim whitespace from the URL", () => {
    const url = "   http://example.com   ";
    const result = getSafeUrl(url);
    expect(result).toBe("http://example.com");
  });

  it("should return null when missing http protocol", () => {
    const url = "testing.com";
    const result = getSafeUrl(url);
    expect(result).toBeNull();
  });
});
