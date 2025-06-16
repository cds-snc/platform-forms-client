import { checkPageVisibility, FormValues, GroupsType } from "../formContext";
import type { PublicFormRecord, FormElement } from "../types";

describe("checkPageVisibility", () => {
  const baseElement: FormElement = {
      id: 1,
      type: "textField",
      properties: { conditionalRules: [] }
  } as unknown as FormElement;

  it("returns true if form has no groups", () => {
    const formRecord = {
      form: {
        elements: [baseElement]
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });

  it("returns true if element's group is in groupHistory (array)", () => {
    const groups: GroupsType = {
      groupA: { name: "A", titleEn: "", titleFr: "", elements: ["1"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    const values: FormValues = { groupHistory: ["groupA"] };
    expect(checkPageVisibility(formRecord, baseElement, values)).toBe(true);
  });

  it("returns true if element's group is in groupHistory (string)", () => {
    const groups: GroupsType = {
      groupA: { name: "A", titleEn: "", titleFr: "", elements: ["1"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    const values: FormValues = { groupHistory: "groupA" };
    expect(checkPageVisibility(formRecord, baseElement, values)).toBe(true);
  });

  it("returns false if element's group is not in groupHistory", () => {
    const groups: GroupsType = {
      groupA: { name: "A", titleEn: "", titleFr: "", elements: ["1"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    const values: FormValues = { groupHistory: ["groupB"] };
    expect(checkPageVisibility(formRecord, baseElement, values)).toBe(false);
  });

  it("returns false if element is not in any group", () => {
    const groups: GroupsType = {
      groupA: { name: "A", titleEn: "", titleFr: "", elements: ["2"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    const values: FormValues = { groupHistory: ["groupA"] };
    expect(checkPageVisibility(formRecord, baseElement, values)).toBe(false);
  });
});