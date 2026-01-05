/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { cleanup } from "@testing-library/react";
import { ShortAnswer } from "../ShortAnswer";
import { withProviders, defaultStore as store } from "@lib/utils/form-builder/test-utils";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () =>
    Promise.resolve({ user: { email: "test@example.com" } }),
}));

describe("ShortAnswer", () => {
  afterEach(cleanup);
  
  it("renders without errors", () => {
    const rendered = withProviders(
      store,
      <ShortAnswer data-testid="short-answer">test content</ShortAnswer>
    );
    expect(rendered.container).toBeTruthy();
  });
});
