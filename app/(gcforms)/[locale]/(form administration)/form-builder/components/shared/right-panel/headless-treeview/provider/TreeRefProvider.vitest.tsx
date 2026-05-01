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
  it("opens the right panel by default and still allows toggling", () => {
    const { result } = renderHook(() => useTreeRef(), { wrapper });

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.togglePanel?.(false);
    });

    expect(result.current.open).toBe(false);
  });
});