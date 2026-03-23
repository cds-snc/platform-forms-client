import { describe, expect, it } from "vitest";
import { testRegexWithTimeout } from "./testRegexWithTimeout";

describe("testRegexWithTimeout", () => {
  it("returns matched true when the regex matches before the timeout", async () => {
    await expect(testRegexWithTimeout(/^[A-Z]{3}$/u, "ABC", 250)).resolves.toEqual({
      matched: true,
      timedOut: false,
    });
  });

  it("returns matched false when the regex does not match before the timeout", async () => {
    await expect(testRegexWithTimeout(/^[A-Z]{3}$/u, "ABCD", 250)).resolves.toEqual({
      matched: false,
      timedOut: false,
    });
  });

  it("uses the flags already present on the regex", async () => {
    await expect(testRegexWithTimeout(/^[a-z]{3}$/i, "ABC", 250)).resolves.toEqual({
      matched: true,
      timedOut: false,
    });
  });

  it("returns timedOut true for a catastrophic regex", async () => {
    const input = `${"A".repeat(50000)}C`;

    await expect(testRegexWithTimeout(/^(A+)*B/, input, 50)).resolves.toEqual({
      matched: false,
      timedOut: true,
    });
  });

  it("rejects non-positive timeout values", async () => {
    await expect(testRegexWithTimeout(/abc/, "abc", 0)).rejects.toThrow(
      /timeoutMs must be a positive number/
    );
  });

  it("uses the default timeout when one is not provided", async () => {
    await expect(testRegexWithTimeout(/abc/, "abc")).resolves.toEqual({
      matched: true,
      timedOut: false,
    });
  });
});