/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";
import { ElementRequired } from "../ElementRequired";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
}));

describe("ElementRequired", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render without errors", () => {
    const item = {
      index: 0,
      ...store.elements[0],
    } as unknown as Parameters<typeof ElementRequired>[0]["item"];

    const onRequiredChange = vi.fn();

    const rendered = render(
      <Providers form={store}>
        <ElementRequired item={item} onRequiredChange={onRequiredChange} />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });
});
