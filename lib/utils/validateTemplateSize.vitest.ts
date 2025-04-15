import { describe, it, expect } from "vitest";
import { validateTemplateSize } from "./validateTemplateSize";

describe("validateTemplateSize", () => {
  it("returns true for a template size within the limit", () => {
    const template = { key: "value" }; // Small template
    const result = validateTemplateSize(JSON.stringify(template)); // 5 MB limit
    expect(result).toBe(true);
  });

  it("returns false for a template size exceeding the limit", () => {
    const largeTemplate = { key: "x".repeat(6 * 1024 * 1024) }; // 6 MB template
    const result = validateTemplateSize(JSON.stringify(largeTemplate)); // 5 MB limit
    expect(result).toBe(false);
  });

  it("handles an empty template correctly", () => {
    const emptyTemplate = {};
    const result = validateTemplateSize(JSON.stringify(emptyTemplate));
    expect(result).toBe(true);
  });

  it("handles undefined template gracefully", () => {
    const result = validateTemplateSize(JSON.stringify(undefined));
    expect(result).toBe(false);
  });
});
