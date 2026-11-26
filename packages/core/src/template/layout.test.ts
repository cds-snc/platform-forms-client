import { describe, expect, it } from "vitest";
import { FormElementTypes, type FormProperties, type GroupsType } from "@gcforms/types";
import { getLayoutFromGroups, sortByGroups, sortByLayout, sortGroup } from "./layout";

const elements = [1, 2, 3, 4, 5, 6, 8, 10].map((id) => ({
  id,
  type: FormElementTypes.textField,
  properties: { titleEn: "", titleFr: "" },
}));

const form = {
  layout: [1, 2, 3, 4],
  elements,
} as FormProperties;

describe("template layout utilities", () => {
  it("sorts using the layout array", () => {
    expect(
      sortByLayout({ layout: [4, 3, 2, 1], elements: elements.slice(0, 4) }).map((e) => e.id)
    ).toEqual([4, 3, 2, 1]);
    expect(
      sortByLayout({
        layout: [3, 4, 1, 2],
        elements: [elements[0], elements[2], elements[1], elements[3]],
      }).map((e) => e.id)
    ).toEqual([3, 4, 1, 2]);
    expect(
      sortByLayout({ layout: [1, 2, 3, 4], elements: elements.slice(0, 4).reverse() }).map(
        (e) => e.id
      )
    ).toEqual([1, 2, 3, 4]);
    expect(
      sortByLayout({ layout: [1, 2, 3, 4], elements: elements.slice(0, 4) }).map((e) => e.id)
    ).toEqual([1, 2, 3, 4]);
  });

  it("handles forms without groups", () => {
    expect(sortByGroups({ form, elements: elements.slice(0, 4) }).map((e) => e.id)).toEqual([
      1, 2, 3, 4,
    ]);
  });

  it("builds an empty layout from empty groups", () => {
    expect(getLayoutFromGroups(form, {})).toEqual([]);
  });

  it("builds an empty layout from groups with no elements", () => {
    const groups = { group1: { elements: [] } } as unknown as GroupsType;
    expect(getLayoutFromGroups(form, groups)).toEqual([]);
  });

  it("builds a layout from one group", () => {
    const groups = {
      group1: { elements: ["5", "8", "1"] },
    } as unknown as GroupsType;
    expect(getLayoutFromGroups(form, groups)).toEqual([5, 8, 1]);
  });

  it("builds a layout from multiple groups", () => {
    const groups = {
      start: { elements: ["4", "3", "2", "6"] },
      group1: { elements: ["5", "1"] },
      group2: { elements: ["8"] },
      end: { elements: [] },
    } as unknown as GroupsType;
    expect(getLayoutFromGroups(form, groups)).toEqual([4, 3, 2, 6, 5, 1, 8]);
  });

  it("sorts elements by groups", () => {
    const groups = {
      group1: { elements: ["3", "1"] },
      group2: { elements: ["4", "2"] },
    } as unknown as GroupsType;
    expect(
      sortByGroups({ form: { ...form, groups }, elements: elements.slice(0, 4) }).map((e) => e.id)
    ).toEqual([3, 1, 4, 2]);
  });

  it("sorts elements within a group", () => {
    const group = { elements: ["3", "1"] } as GroupsType[string];
    expect(sortGroup({ form, group }).map((element) => element.id)).toEqual([3, 1]);
  });
});
