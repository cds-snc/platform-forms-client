import { sanitizeUrl, isValidUrl } from "./url";

describe("sanitizeUrl", () => {
  it("returns safe http/https URLs unchanged", () => {
    expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("returns safe mailto", () => {
    expect(sanitizeUrl("mailto:test@example.com")).toBe("mailto:test@example.com");
  });

  it("returns relative URLs unchanged", () => {
    expect(sanitizeUrl("/relative/path")).toBe("/relative/path");
    expect(sanitizeUrl("foo/bar")).toBe("foo/bar");
    expect(sanitizeUrl("index.html")).toBe("index.html");
  });

  it("trims whitespace from URLs", () => {
    expect(sanitizeUrl("  http://example.com  ")).toBe("http://example.com");
    expect(sanitizeUrl("   /foo/bar  ")).toBe("/foo/bar");
  });

  it("returns about:blank for unsafe URLs (does not sanitize)", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("about:blank");
    expect(sanitizeUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(
      "about:blank"
    );
  });

  it("returns trimmed input for non-URL strings", () => {
    expect(sanitizeUrl("not a url")).toBe("not a url");
    expect(sanitizeUrl("   not a url   ")).toBe("not a url");
  });

  it("returns about:blank for unsupported protocols", () => {
    expect(sanitizeUrl("ftp://example.com")).toBe("about:blank");
  });

  it("handles empty string", () => {
    expect(sanitizeUrl("")).toBe("");
  });
});

describe("isValidUrl", () => {
  it("returns true for valid http/https URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://sub.domain.com/path?query=1")).toBe(true);
  });

  it("returns true for valid mailto URLs", () => {
    expect(isValidUrl("mailto:test@example.com")).toBe(true);
  });

  it("returns true for valid tel URLs", () => {
    expect(isValidUrl("tel:+1234567890")).toBe(true);
    expect(isValidUrl("tel:123-456-7890")).toBe(true);
    expect(isValidUrl("tel:(123)456-7890")).toBe(true);
  });

  it("returns true for valid sms URLs", () => {
    expect(isValidUrl("sms:+1234567890")).toBe(true);
    expect(isValidUrl("sms:123-456-7890")).toBe(true);
    expect(isValidUrl("sms:(123)456-7890")).toBe(true);
  });

  it("returns false for invalid URLs", () => {
    expect(isValidUrl("notaurl")).toBe(false);
    expect(isValidUrl("http:/bad")).toBe(false);
    expect(isValidUrl("ftp://example.com")).toBe(false); // ftp is not in regexp
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
    expect(isValidUrl("data:image/png;base64,abc")).toBe(false);
    expect(isValidUrl("tel:")).toBe(false);
    expect(isValidUrl("sms:")).toBe(false);
    expect(isValidUrl("tel:abc-def-ghij")).toBe(false);
    expect(isValidUrl("sms:abc-def-ghij")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("returns true for mailto with query params", () => {
    expect(isValidUrl("mailto:user@example.com?subject=Hello")).toBe(true);
  });

  it("returns false for malformed mailto addresses", () => {
    expect(isValidUrl("mailto:user@")).toBe(false);
    expect(isValidUrl("mailto:@example.com")).toBe(false);
    expect(isValidUrl("mailto:")).toBe(false);
  });

  it("returns false for URLs with internal whitespace", () => {
    expect(isValidUrl("http://exa mple.com")).toBe(false);
    expect(isValidUrl("mailto:test@ example.com")).toBe(false);
    expect(isValidUrl("tel:123 456 7890")).toBe(false);
    expect(isValidUrl("sms:123 456 7890")).toBe(false);
  });

  it("returns false for internationalized domain names (unicode)", () => {
    expect(isValidUrl("http://exämple.com")).toBe(false);
  });
});