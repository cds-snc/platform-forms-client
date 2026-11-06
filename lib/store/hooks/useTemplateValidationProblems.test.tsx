/** @vitest-environment jsdom */
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import navigationFocus from "@root/__fixtures__/navigationFocus.json";
import { type FormProperties } from "@lib/types";
import { useTemplateValidationProblems } from "./useTemplateValidationProblems";

let form = structuredClone(navigationFocus) as FormProperties;

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (select: (state: { form: FormProperties }) => unknown) => select({ form }),
}));

describe("useTemplateValidationProblems", () => {
  it("validates immutable editor state without sanitizing or modifying it", () => {
    form = structuredClone(navigationFocus) as FormProperties;
    form.titleEn = "<Title>";
    Object.freeze(form);
    form.elements.forEach((element) => {
      Object.freeze(element.properties);
      Object.freeze(element);
    });
    const original = structuredClone(form);
    const { result, rerender } = renderHook(() => useTemplateValidationProblems());
    expect(result.current).toEqual([]);
    expect(form).toEqual(original);

    form = { ...form, schemaVersion: 999 };
    rerender();
    expect(result.current).toContainEqual(
      expect.objectContaining({ path: "schemaVersion", name: "schema" })
    );
    expect(form.titleEn).toBe("<Title>");
  });
});
