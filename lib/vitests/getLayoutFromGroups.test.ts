import { getLayoutFromGroups } from "@lib/utils/form-builder/groupedFormHelpers";
import { FormProperties } from "@lib/types";
import validFormTemplate from "../../__fixtures__/testDataWithGroups.json";

describe("getLayoutFromGroups function", () => {

  const form = validFormTemplate as FormProperties;

  it("Handles empty groups", () => {
    const groups = {};
    form.groups = groups;
    expect(getLayoutFromGroups(form, groups)).toEqual([]);
  });

  it("Handles groups with no elements", () => {
    const groups = {
      "group1": { name: "group1", titleEn: "", titleFr: "", nextAction: "group2", elements: [] }
    };
    form.groups = groups;
    expect(getLayoutFromGroups(form, groups)).toEqual([]);
  });

  it("Handles groups with elements", () => {
    const groups = {
      "group1": { name: "group1", titleEn: "", titleFr: "", nextAction: "group2", elements: ["5", "8", "1"] }
    };
    form.groups = groups;
    expect(getLayoutFromGroups(form, groups)).toEqual([5, 8, 1]);
  });

  it("Handles multiple groups with element", () => {
    const groups = {
      "start": { name: "start", titleEn: "", titleFr: "", nextAction: "group1", elements: ["4", "3", "2", "6"] },
      "group1": { name: "group1", titleEn: "", titleFr: "", nextAction: "group2", elements: ["5", "1"] },
      "group2": { name: "group2", titleEn: "", titleFr: "", nextAction: "group3", elements: ["8"] },
      "end": { name: "end", titleEn: "", titleFr: "", elements: [] }
    };
    form.groups = groups;
    expect(getLayoutFromGroups(form, groups)).toEqual([4, 3, 2, 6, 5, 1, 8]);
  });

  it("Handles multiple groups with some elements", () => {
    const groups = {
      "start": { name: "start", titleEn: "", titleFr: "", nextAction: "group1", elements: [] },
      "group1": { name: "group1", titleEn: "", titleFr: "", nextAction: "group2", elements: ["8", "2"] },
      "group2": { name: "group2", titleEn: "", titleFr: "", nextAction: "group3", elements: [] },
      "end": { name: "end", titleEn: "", titleFr: "", elements: [] }
    };
    form.groups = groups;
    expect(getLayoutFromGroups(form, groups)).toEqual([8, 2]);
  });
});