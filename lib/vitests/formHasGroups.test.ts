import { FormProperties } from "@lib/types";
import { formHasGroups } from "@lib/utils/form-builder/formHasGroups";
import validFormTemplate from "../../__fixtures__/testDataWithGroups.json";
describe("formHasGroups function", () => {
  it("Has valid groups", () => {
    const form = validFormTemplate as FormProperties;
    expect(formHasGroups(form)).toBe(true);
  });

  it("Handles undefined", () => {
    const form = undefined as unknown as FormProperties;
    expect(formHasGroups(form)).toBe(false);
  });

  it("Handles null", () => {
    const form = null as unknown as FormProperties;
    expect(formHasGroups(form)).toBe(false);
  });

  it("Handles empty object", () => {
    const form = {} as FormProperties;
    expect(formHasGroups(form)).toBe(false);
  });

  it("Handles empty groups", () => {
    const form = { groups: {} } as FormProperties;
    expect(formHasGroups(form)).toBe(false);
  });

  it("Handles groups with no elements", () => {
    const form = validFormTemplate as FormProperties;
    form.groups = { group1: { name: "group1", titleEn:"", titleFr:"", nextAction: "group2", elements: [] } };
    expect(formHasGroups(form)).toBe(true);
  });

  it("Handles groups with elements", () => {
    const form = validFormTemplate as FormProperties;
    form.groups = { group1: { name: "group1", titleEn:"", titleFr:"", nextAction: "group2", elements: ["5", "8", "10"] } };
    expect(formHasGroups(form)).toBe(true);
  });
});