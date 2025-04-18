import {
  sortByLayout,
  swap,
  moveUp,
  moveDown,
  removeElementById,
  isValidatedTextType,
  incrementSubElementId,
  removeGroupElement,
} from "../index";

describe("Util", () => {
  it("sorts using layout array", () => {
    const sorted1 = sortByLayout({
      layout: [4, 3, 2, 1],
      elements: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    });
    expect(sorted1).toEqual([{ id: 4 }, { id: 3 }, { id: 2 }, { id: 1 }]);

    const sorted2 = sortByLayout({
      layout: [3, 4, 1, 2],
      elements: [{ id: 1 }, { id: 3 }, { id: 2 }, { id: 4 }],
    });
    expect(sorted2).toEqual([{ id: 3 }, { id: 4 }, { id: 1 }, { id: 2 }]);

    const sorted3 = sortByLayout({
      layout: [1, 2, 3, 4],
      elements: [{ id: 1 }, { id: 3 }, { id: 2 }, { id: 4 }],
    });
    expect(sorted3).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);

    const sorted4 = sortByLayout({
      layout: [1, 2, 3, 4],
      elements: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
    });
    expect(sorted4).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
  });

  it("increments subElement id", () => {
    expect(incrementSubElementId([], 4)).toBe(401);
    expect(incrementSubElementId([], 5)).toBe(501);
    expect(incrementSubElementId([{ id: 301 }], 3)).toBe(302);
    expect(incrementSubElementId([{ id: 101 }, { id: 102 }, { id: 111 }], 1)).toBe(112);
  });

  it("swaps array indexes", () => {
    expect(swap([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }], 1, 2)).toEqual([
      { id: 1 },
      { id: 3 },
      { id: 2 },
      { id: 4 },
    ]);

    expect(swap([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }], 0, 1)).toEqual([
      { id: 2 },
      { id: 1 },
      { id: 3 },
      { id: 4 },
    ]);
  });

  it("moves element down in array", () => {
    expect(moveDown([{ id: 1 }, { id: 3 }, { id: 2 }], 1)).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);
  });

  it("moves element up in array", () => {
    expect(moveUp([{ id: 1 }, { id: 3 }, { id: 2 }], 2)).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("removes element by (id) from array", () => {
    expect(removeElementById([{ id: 1 }, { id: 2 }, { id: 4 }], 2)).toEqual([{ id: 1 }, { id: 4 }]);
    expect(removeElementById([{ id: 1 }, { id: 2 }, { id: 4 }], 4)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("detects text fields that have a validation type", () => {
    expect(isValidatedTextType("textField")).toEqual(false);
    expect(isValidatedTextType("richText")).toEqual(false);
    expect(isValidatedTextType("email")).toEqual(true);
    expect(isValidatedTextType("tel")).toEqual(true);
    expect(isValidatedTextType("date")).toEqual(true);
    expect(isValidatedTextType("number")).toEqual(true);
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
    };

    const updatedGroups = removeGroupElement(groups, "start", "2");
    expect(updatedGroups.start).toEqual({
      name: "start",
      elements: ["1", "3", "4"],
    });

    expect(updatedGroups.g1).toEqual(groups.g1);
  });
});
