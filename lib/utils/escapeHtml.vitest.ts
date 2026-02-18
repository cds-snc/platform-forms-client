import { describe, it, expect } from "vitest";
import { escapeHtml } from "./escapeHtml";

describe("escapeHtml", () => {
  it("should escape ampersands", () => {
    expect(escapeHtml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("should escape less-than signs", () => {
    expect(escapeHtml("5 < 10")).toBe("5 &lt; 10");
  });

  it("should escape greater-than signs", () => {
    expect(escapeHtml("10 > 5")).toBe("10 &gt; 5");
  });

  it("should escape double quotes", () => {
    expect(escapeHtml('"quoted text"')).toBe("&quot;quoted text&quot;");
  });

  it("should escape single quotes", () => {
    expect(escapeHtml("It's great")).toBe("It&#39;s great");
  });

  it("should escape HTML tags", () => {
    expect(escapeHtml("<script>alert('XSS')</script>")).toBe(
      "&lt;script&gt;alert(&#39;XSS&#39;)&lt;/script&gt;"
    );
  });

  it("should escape multiple special characters", () => {
    expect(escapeHtml('<div class="test">Hello & goodbye</div>')).toBe(
      "&lt;div class=&quot;test&quot;&gt;Hello &amp; goodbye&lt;/div&gt;"
    );
  });

  it("should handle empty strings", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("should handle strings without special characters", () => {
    expect(escapeHtml("Hello world")).toBe("Hello world");
  });

  it("should handle non-string values", () => {
    expect(escapeHtml(123)).toBe("123");
    expect(escapeHtml(true)).toBe("true");
    expect(escapeHtml(null)).toBe("null");
    expect(escapeHtml(undefined)).toBe("undefined");
  });

  it("should escape XSS attack vectors", () => {
    expect(escapeHtml("<img src=x onerror=alert('XSS')>")).toBe(
      "&lt;img src=x onerror=alert(&#39;XSS&#39;)&gt;"
    );
    expect(escapeHtml('"><script>alert(document.cookie)</script>')).toBe(
      "&quot;&gt;&lt;script&gt;alert(document.cookie)&lt;/script&gt;"
    );
    expect(escapeHtml("javascript:alert('XSS')")).toBe("javascript:alert(&#39;XSS&#39;)");
  });

  it("should preserve order of escaping (ampersand first)", () => {
    // If & is not escaped first, subsequent escapes would double-escape
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });
});
