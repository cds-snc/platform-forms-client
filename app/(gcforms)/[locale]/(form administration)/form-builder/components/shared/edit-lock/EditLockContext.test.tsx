/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";

import { isEditPath, useEditLockContext } from "./EditLockContext";

describe("EditLockContext", () => {
  it("treats publish routes as edit-lock pages", () => {
    expect(isEditPath("/en/form-builder/123/publish")).toBe(true);
    expect(isEditPath("/en/form-builder/123/published")).toBe(true);
  });

  it("throws when the hook is used outside EditLockProvider", () => {
    expect(() => renderHook(() => useEditLockContext())).toThrow(
      "useEditLockContext must be used within EditLockProvider. Wrap the calling component in EditLockProvider."
    );
  });
});