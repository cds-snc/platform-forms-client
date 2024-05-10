import { getLayoutFromGroups } from "@lib/utils/form-builder/getLayoutFromGroups";
describe("getLayoutFromGroups function", () => {
  it("Handles empty groups", () => {
    const groups = {};
    expect(getLayoutFromGroups(groups)).toEqual([]);
  });

  it("Handles groups with no elements", () => {
    const groups = {
      "group1": { name: "group1", nextAction: "group2", elements: [] }
    };
    expect(getLayoutFromGroups(groups)).toEqual([]);
  });

  it("Handles groups with elements", () => {
    const groups = {
      "group1": { name: "group1", nextAction: "group2", elements: ["5", "8", "10"] }
    };
    expect(getLayoutFromGroups(groups)).toEqual([5, 8, 10]);
  });

  it("Handles multiple groups with element", () => {
    const groups = {
      "start": { name: "start", nextAction: "group1", elements: ["4", "3", "2", "6"] },
      "group1": { name: "group1", nextAction: "group2", elements: ["5", "8", "10"] },
      "group2": { name: "group2", nextAction: "group3", elements: ["21", "24"] },
      "end": { name: "end", elements: [] }
    };
    expect(getLayoutFromGroups(groups)).toEqual([4, 3, 2, 6, 5, 8, 10, 21, 24]);
  });

  it("Handles multiple groups with some elements", () => {
    const groups = {
      "start": { name: "start", nextAction: "group1", elements: [] },
      "group1": { name: "group1", nextAction: "group2", elements: ["18", "2"] },
      "group2": { name: "group2", nextAction: "group3", elements: [] },
      "end": { name: "end", elements: [] }
    };
    expect(getLayoutFromGroups(groups)).toEqual([18, 2]);
  });
});