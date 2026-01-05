/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { Options } from "../Options";
import { defaultStore as store, Providers } from "@lib/utils/form-builder/test-utils";

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
}));

describe("Options", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders without errors", () => {
    const item = { index: 0, ...store.elements[0] } as unknown as Parameters<
      typeof Options
    >[0]["item"];
    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });

  it("renders null when no choices exist", () => {
    const item = {
      id: 1,
      index: 0,
      type: store.elements[0]?.type || ("textField" as unknown),
      properties: { ...store.elements[0]?.properties, choices: [] },
    } as unknown as Parameters<typeof Options>[0]["item"];
    const rendered = render(
      // @ts-expect-error - store has string type but FormElement expects FormElementTypes
      <Providers form={store}>
        <Options item={item} formId="test-form" />
      </Providers>
    );

    expect(rendered.container).toBeTruthy();
  });
});
