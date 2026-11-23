import { describe, expect, it } from "vitest";
import { formatAuthError } from "@lib/auth/authLogging";

describe("formatAuthError", () => {
  it("includes the Auth.js error type and nested cause", () => {
    const error = Object.assign(new Error("Callback failed"), {
      type: "OAuthCallbackError",
      cause: { err: new Error("Issuer unavailable") },
    });

    expect(formatAuthError(error)).toBe(
      "NextAuth error [OAuthCallbackError]: Callback failed; cause: Error: Issuer unavailable"
    );
  });

  it("falls back to the error name when no Auth.js type is present", () => {
    expect(formatAuthError(new Error("Unexpected failure"))).toBe(
      "NextAuth error [Error]: Unexpected failure"
    );
  });
});
