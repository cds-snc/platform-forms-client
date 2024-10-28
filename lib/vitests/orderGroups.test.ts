import { expect } from 'vitest'
import { GroupsType } from "@lib/formContext";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";

describe("orderGroups function", () => {
  it("Returns empty object", () => {
    const groups = {};
    const groupsLayout: string[] = [];
    const result = orderGroups(groups, groupsLayout);
    expect(result).toEqual({});
  });

  it("Returns object with start group", () => {
    const groups = {
      start: {
        id: "start",
        name: "Start",
      },
    } as unknown as GroupsType;
    const groupsLayout: string[] = [];
    const result = orderGroups(groups, groupsLayout);
    expect(result).toEqual({
      start: {
        id: "start",
        name: "Start",
      },
    });
  });

  it("Returns object with start and end groups", () => {
    const groups = {
      start: {
        id: "start",
        name: "Start",
      },
      end: {
        id: "end",
        name: "End",
      },
    } as unknown as GroupsType;
    const groupsLayout: string[] = [];
    const result = orderGroups(groups, groupsLayout);
    expect(result).toEqual({
      start: {
        id: "start",
        name: "Start",
      },
      end: {
        id: "end",
        name: "End",
      },
    });
  });

  it("Returns object ordered by the layout array (reversed)", () => {
    const groups = {
      a: {},
      b: {},
      c: {},
      d: {},
    } as unknown as GroupsType;
    const groupsLayout: string[] = ["d", "b", "a", "c"];
    const result = orderGroups(groups, groupsLayout);

    expect(result).toEqual({
      d: {},
      b: {},
      a: {},
      c: {},
    });
  });

  it("Returns object ordered by the layout array (random)", () => {
    const groups = {
      a: {},
      b: {},
      c: {},
      d: {},
    } as unknown as GroupsType;
    const groupsLayout: string[] = ["b", "a", "d", "c"];
    const result = orderGroups(groups, groupsLayout);

    expect(result).toEqual({
      b: {},
      a: {},
      d: {},
      c: {},
    });
  });
});