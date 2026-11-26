import { describe, expect, it } from "vitest";
import { type FormProperties, type GroupsType } from "@gcforms/types";
import { formHasGroups, orderGroups } from "./groups";

describe("formHasGroups", () => {
  it("handles a valid form template", () => {
    expect(
      formHasGroups({
        groups: { group1: { elements: [] } },
      } as unknown as FormProperties)
    ).toBe(true);
  });

  it("handles undefined", () => {
    expect(formHasGroups(undefined as unknown as FormProperties)).toBe(false);
  });

  it("handles null", () => {
    expect(formHasGroups(null as unknown as FormProperties)).toBe(false);
  });

  it("handles an empty object", () => {
    expect(formHasGroups({} as unknown as FormProperties)).toBe(false);
  });

  it("handles empty groups", () => {
    expect(formHasGroups({ groups: {} } as unknown as FormProperties)).toBe(false);
  });

  it("handles groups with no elements", () => {
    expect(
      formHasGroups({ groups: { group1: { elements: [] } } } as unknown as FormProperties)
    ).toBe(true);
  });

  it("handles groups with elements", () => {
    expect(
      formHasGroups({
        groups: { group1: { elements: ["5", "8", "10"] } },
      } as unknown as FormProperties)
    ).toBe(true);
  });
});

describe("orderGroups", () => {
  it("returns an empty object", () => {
    expect(orderGroups({}, [])).toEqual({});
  });

  it("preserves the start group", () => {
    const groups = {
      start: {},
    } as unknown as GroupsType;

    expect(orderGroups(groups, [])).toEqual({ start: {} });
  });

  it("preserves the start and end groups", () => {
    const groups = {
      start: {},
      end: {},
    } as unknown as GroupsType;

    expect(orderGroups(groups, [])).toEqual({
      start: {},
      end: {},
    });
  });

  it("follows a reversed layout", () => {
    const groups = { a: {}, b: {}, c: {}, d: {} } as unknown as GroupsType;
    expect(orderGroups(groups, ["d", "b", "a", "c"])).toEqual({
      d: {},
      b: {},
      a: {},
      c: {},
    });
  });

  it("follows a random layout", () => {
    const groups = { a: {}, b: {}, c: {}, d: {} } as unknown as GroupsType;
    expect(orderGroups(groups, ["b", "a", "d", "c"])).toEqual({
      b: {},
      a: {},
      d: {},
      c: {},
    });
  });
});
