/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { Option } from "../Option";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";
// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
}));
describe("Option", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without errors", () => {
    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Option parentIndex={0} index={0} id={1} initialValue="my test option" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });
});
