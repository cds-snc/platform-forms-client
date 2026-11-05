/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTemplateVersioning } from "./useTemplateVersioning";

describe("useTemplateVersioning", () => {
  it("returns all ids and empty version data when metadata is not provided", () => {
    const checkedItems = new Map<string, boolean>([
      ["response-1", true],
      ["response-2", true],
    ]);

    const { result } = renderHook(() => useTemplateVersioning(checkedItems));

    expect(result.current.ids).toEqual(["response-1", "response-2"]);
    expect(Array.from(result.current.metaMap.entries())).toEqual([]);
    expect(result.current.filteredIdsWithVersion).toEqual([]);
    expect(result.current.dialogVersions).toEqual([]);
    expect(result.current.getFilteredIds()).toEqual([]);
  });

  it("filters out items without versions and deduplicates dialog versions", () => {
    const checkedItems = new Map<string, boolean>([
      ["response-1", true],
      ["response-2", true],
      ["response-3", true],
      ["response-4", true],
    ]);

    const checkedMeta = [
      { name: "response-1", version: "v1" },
      { name: "response-2", version: null },
      { name: "response-3", version: "v2" },
      { name: "response-4", version: "v1" },
    ];

    const { result } = renderHook(() => useTemplateVersioning(checkedItems, checkedMeta));

    expect(result.current.filteredIdsWithVersion).toEqual([
      "response-1",
      "response-3",
      "response-4",
    ]);
    expect(result.current.dialogVersions).toEqual(["v1", "v2"]);
    expect(result.current.getFilteredIds()).toEqual(["response-1", "response-3", "response-4"]);
  });

  it("returns only ids for the selected version", () => {
    const checkedItems = new Map<string, boolean>([
      ["response-1", true],
      ["response-2", true],
      ["response-3", true],
    ]);

    const checkedMeta = [
      { name: "response-1", version: "v1" },
      { name: "response-2", version: "v2" },
      { name: "response-3", version: "v1" },
    ];

    const { result } = renderHook(() => useTemplateVersioning(checkedItems, checkedMeta));

    expect(result.current.getFilteredIds("v1")).toEqual(["response-1", "response-3"]);
    expect(result.current.getFilteredIds("v2")).toEqual(["response-2"]);
    expect(result.current.getFilteredIds("missing-version")).toEqual([]);
  });

  it("normalizes numeric versions for dialog filtering", () => {
    const checkedItems = new Map<string, boolean>([
      ["response-1", true],
      ["response-2", true],
      ["response-3", true],
    ]);

    const checkedMeta = [
      { name: "response-1", version: 1 },
      { name: "response-2", version: 2 },
      { name: "response-3", version: 1 },
    ];

    const { result } = renderHook(() => useTemplateVersioning(checkedItems, checkedMeta));

    expect(result.current.dialogVersions).toEqual(["1", "2"]);
    expect(result.current.getFilteredIds("1")).toEqual(["response-1", "response-3"]);
    expect(result.current.getFilteredIds("2")).toEqual(["response-2"]);
  });
});
