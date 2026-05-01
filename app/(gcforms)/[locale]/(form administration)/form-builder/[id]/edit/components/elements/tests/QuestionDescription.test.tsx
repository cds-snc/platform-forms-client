/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import {
  defaultStore as store,
  Providers,
  localStorageMock,
} from "@lib/utils/form-builder/test-utils";
import { QuestionDescription } from "../question/QuestionDescription";

// Mock sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
});

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
}));

describe("Question", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without errors", () => {
    const item = { index: 0, ...store.elements[0] } as unknown as Parameters<
      typeof QuestionDescription
    >[0]["item"];

    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <QuestionDescription item={item} describedById="described-by-id" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });
});
