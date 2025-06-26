import { checkPageVisibility, FormValues, GroupsType } from "../formContext";
import type { PublicFormRecord, FormElement } from "../types";

describe("checkPageVisibility", () => {
  const baseElement: FormElement = {
    id: 1,
    type: "textField",
    properties: { conditionalRules: [] }
  } as unknown as FormElement;

  const radioElement: FormElement = {
    id: 2,
    type: "radio",
    properties: {
      conditionalRules: [],
      choices: [
        { en: "Option A", fr: "Option A" },
        { en: "Option B", fr: "Option B" }
      ]
    }
  } as unknown as FormElement;

  it("returns true if form has no groups", () => {
    const formRecord = {
      form: {
        elements: [baseElement]
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });

  it("returns true if groups object is empty", () => {
    const formRecord = {
      form: {
        elements: [baseElement],
        groups: {}
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });

  it("returns true if element is in a group reachable from start", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "Group A", titleFr: "Group A", elements: ["1"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });

  it("returns false if element is in a group not reachable from start", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "Group A", titleFr: "Group A", elements: ["2"] },
      groupB: { name: "B", titleEn: "Group B", titleFr: "Group B", elements: ["1"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(false);
  });

  it("returns false if element is not in any group", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "Group A", titleFr: "Group A", elements: ["2"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(false);
  });

  it("follows conditional navigation with nextAction array based on form values", () => {
    const groups: GroupsType = {
      start: { 
        name: "Start", 
        titleEn: "Start", 
        titleFr: "Start", 
        elements: ["2"], 
        nextAction: [
          { choiceId: "2.0", groupId: "groupA" },
          { choiceId: "2.1", groupId: "groupB" }
        ]
      },
      groupA: { name: "A", titleEn: "Group A", titleFr: "Group A", elements: ["1"] },
      groupB: { name: "B", titleEn: "Group B", titleFr: "Group B", elements: ["3"] }
    };
    
    const element3: FormElement = {
      id: 3,
      type: "textField",
      properties: { conditionalRules: [] }
    } as unknown as FormElement;

    const formRecord = {
      form: {
        elements: [baseElement, radioElement, element3],
        groups
      }
    } as PublicFormRecord;

    // When radio element has value "Option A" (index 0), should go to groupA
    const valuesForGroupA: FormValues = { "2": "Option A" };
    expect(checkPageVisibility(formRecord, baseElement, valuesForGroupA)).toBe(true);
    expect(checkPageVisibility(formRecord, element3, valuesForGroupA)).toBe(false);

    // When radio element has value "Option B" (index 1), should go to groupB  
    const valuesForGroupB: FormValues = { "2": "Option B" };
    expect(checkPageVisibility(formRecord, baseElement, valuesForGroupB)).toBe(false);
    expect(checkPageVisibility(formRecord, element3, valuesForGroupB)).toBe(true);
  });

  it("handles exit nextAction", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: ["1"], nextAction: "exit" }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });

  it("prevents infinite loops by tracking visited groups", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "Group A", titleFr: "Group A", elements: ["1"], nextAction: "groupB" },
      groupB: { name: "B", titleEn: "Group B", titleFr: "Group B", elements: [], nextAction: "groupA" }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });

  it("handles missing groups gracefully", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "nonExistentGroup" }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(false);
  });

  it("handles chain of groups with simple nextAction strings", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "Group A", titleFr: "Group A", elements: [], nextAction: "groupB" },
      groupB: { name: "B", titleEn: "Group B", titleFr: "Group B", elements: ["1"] }
    };
    const formRecord = {
      form: {
        elements: [baseElement],
        groups
      }
    } as PublicFormRecord;
    expect(checkPageVisibility(formRecord, baseElement, {})).toBe(true);
  });
});