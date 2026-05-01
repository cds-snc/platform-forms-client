import { describe, it, expect } from "vitest";
import {
  sortByLayout,
  swapElement,
  moveElementUp,
  moveElementDown,
  removeElementById,
  isValidatedTextType,
  incrementSubElementId,
  removeGroupElement,
} from "../index";
import type { FormElement } from "@lib/types";
import type { GroupsType } from "@gcforms/types";

import { FormElementTypes } from "@gcforms/types";

// minimal fixture helper — keep shallow to avoid deep fixtures
const el = (id: number): FormElement =>
  ({ id, type: FormElementTypes.textField }) as unknown as FormElement;

describe("Util", () => {
  it("sorts using layout array", () => {
    const sorted1 = sortByLayout({
      layout: [4, 3, 2, 1],
      elements: [el(1), el(2), el(3), el(4)],
    });
    expect(sorted1.map((e) => e.id)).toEqual([4, 3, 2, 1]);

    const sorted2 = sortByLayout({
      layout: [3, 4, 1, 2],
      elements: [el(1), el(3), el(2), el(4)],
    });
    expect(sorted2.map((e) => e.id)).toEqual([3, 4, 1, 2]);

    const sorted3 = sortByLayout({
      layout: [1, 2, 3, 4],
      elements: [el(1), el(3), el(2), el(4)],
    });
    expect(sorted3.map((e) => e.id)).toEqual([1, 2, 3, 4]);

    const sorted4 = sortByLayout({
      layout: [1, 2, 3, 4],
      elements: [el(1), el(2), el(3), el(4)],
    });
    expect(sorted4.map((e) => e.id)).toEqual([1, 2, 3, 4]);
  });

  it("increments subElement id", () => {
    expect(incrementSubElementId([], 4)).toBe(401);
    expect(incrementSubElementId([], 5)).toBe(501);
    expect(incrementSubElementId([el(301)], 3)).toBe(302);
    expect(incrementSubElementId([el(101), el(102), el(111)], 1)).toBe(112);
  });

  it("swaps array indexes", () => {
    expect(swapElement([el(1), el(2), el(3), el(4)], 1, 2)).toEqual([el(1), el(3), el(2), el(4)]);

    expect(swapElement([el(1), el(2), el(3), el(4)], 0, 1)).toEqual([el(2), el(1), el(3), el(4)]);
  });

  it("moves element down in array", () => {
    expect(moveElementDown([el(1), el(3), el(2)], 1)).toEqual([el(1), el(2), el(3)]);
  });

  it("moves element up in array", () => {
    expect(moveElementUp([el(1), el(3), el(2)], 2)).toEqual([el(1), el(2), el(3)]);
  });

  it("removes element by (id) from array", () => {
    expect(removeElementById([el(1), el(2), el(4)], 2)).toEqual([el(1), el(4)]);
    expect(removeElementById([el(1), el(2), el(4)], 4)).toEqual([el(1), el(2)]);
  });

  it("detects text fields that have a validation type", () => {
    expect(isValidatedTextType(FormElementTypes.textField)).toEqual(false);
    expect(isValidatedTextType(FormElementTypes.richText)).toEqual(false);
    expect(isValidatedTextType("email" as FormElementTypes)).toEqual(true);
    expect(isValidatedTextType("tel" as unknown as FormElementTypes)).toEqual(true);
    expect(isValidatedTextType("date" as unknown as FormElementTypes)).toEqual(true);
    expect(isValidatedTextType("number" as FormElementTypes)).toEqual(true);
  });

  it("removes element from group", () => {
    const groups = {
      start: {
        name: "start",
        elements: ["1", "2", "3", "4"],
      },
      g1: {
        name: "g1",
        elements: ["5", "6", "7", "8"],
      },
    } as unknown as GroupsType;

    const updatedGroups = removeGroupElement(groups, "start", 2);
    expect(updatedGroups).toBeDefined();
    expect(updatedGroups!.start).toEqual({
      name: "start",
      elements: ["1", "3", "4"],
    });

    expect(updatedGroups!.g1).toEqual(groups.g1);
  });
});
