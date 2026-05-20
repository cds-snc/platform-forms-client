/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, renderHook } from "@testing-library/react";

import { TreeRefProvider, useTreeRef } from "./TreeRefProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TreeRefProvider>{children}</TreeRefProvider>
);

describe("TreeRefProvider", () => {
  it("starts with the right panel closed and still allows toggling", () => {
    const { result } = renderHook(() => useTreeRef(), { wrapper });

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.togglePanel?.(true);
    });

    expect(result.current.open).toBe(true);
  });
});