import { checkPageVisibility, FormValues, GroupsType, getValuesWithMatchedIds, 
  getVisibleGroupsBasedOnValuesRecursive } from "../formContext";
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

describe("getValuesWithMatchedIds", () => {
  const textElement: FormElement = {
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
        { en: "Option A", fr: "Option A FR" },
        { en: "Option B", fr: "Option B FR" },
        { en: "Option C", fr: "Option C FR" }
      ]
    }
  } as unknown as FormElement;

  const checkboxElement: FormElement = {
    id: 3,
    type: "checkbox",
    properties: {
      conditionalRules: [],
      choices: [
        { en: "Choice 1", fr: "Choice 1 FR" },
        { en: "Choice 2", fr: "Choice 2 FR" }
      ]
    }
  } as unknown as FormElement;

  const formElements = [textElement, radioElement, checkboxElement];

  it("returns unchanged values for non-choice elements", () => {
    const values: FormValues = { "1": "Some text value" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "1": "Some text value" });
  });

  it("converts radio values to choice IDs with English text", () => {
    const values: FormValues = { "2": "Option B" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "2": "2.1" });
  });

  it("converts radio values to choice IDs with French text", () => {
    const values: FormValues = { "2": "Option A FR" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "2": "2.0" });
  });

  it("converts checkbox values to choice IDs", () => {
    const values: FormValues = { "3": "Choice 2" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "3": "3.1" });
  });

  it("handles multiple elements with mixed types", () => {
    const values: FormValues = {
      "1": "Text value",
      "2": "Option C",
      "3": "Choice 1"
    };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({
      "1": "Text value",
      "2": "2.2",
      "3": "3.0"
    });
  });

  it("resets values when choice is not found", () => {
    const values: FormValues = { "2": "Non-existent option" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "2": "" });
  });

  it("ignores reserved keys (currentGroup, groupHistory, matchedIds)", () => {
    const values: FormValues = {
      "2": "Option A",
      "currentGroup": "start",
      "groupHistory": ["start"],
      "matchedIds": ["2.0"]
    };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({
      "2": "2.0",
      "currentGroup": "start",
      "groupHistory": ["start"],
      "matchedIds": ["2.0"]
    });
  });

  it("handles empty values", () => {
    const values: FormValues = { "2": "" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "2": "" });
  });

  it("handles elements without choices", () => {
    const elementWithoutChoices: FormElement = {
      id: 4,
      type: "radio",
      properties: { conditionalRules: [] }
    } as unknown as FormElement;

    const values: FormValues = { "4": "Some value" };
    const result = getValuesWithMatchedIds([elementWithoutChoices], values);
    expect(result).toEqual({ "4": "Some value" });
  });

  it("handles elements that don't exist in formElements", () => {
    const values: FormValues = { "999": "Non-existent element" };
    const result = getValuesWithMatchedIds(formElements, values);
    expect(result).toEqual({ "999": "Non-existent element" });
  });
});

describe("getVisibleGroupsBasedOnValuesRecursive", () => {
  it("returns history when current group is already visited (prevents infinite loops)", () => {
    const groups: GroupsType = {
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [], nextAction: "groupB" },
      groupB: { name: "B", titleEn: "B", titleFr: "B", elements: [], nextAction: "groupA" }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      {},
      "groupA",
      ["groupA"] // groupA already in history
    );
    
    expect(result).toEqual(["groupA"]);
  });

  it("returns history when current group doesn't exist", () => {
    const groups: GroupsType = {
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      {},
      "nonExistentGroup",
      ["start"]
    );
    
    expect(result).toEqual(["start"]);
  });

  it("handles simple string nextAction", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [], nextAction: "groupB" },
      groupB: { name: "B", titleEn: "B", titleFr: "B", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      {},
      "start"
    );
    
    expect(result).toEqual(["start", "groupA", "groupB"]);
  });

  it("handles exit nextAction", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "exit" }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      {},
      "start"
    );
    
    expect(result).toEqual(["start"]);
  });

  it("handles conditional nextAction with matching choice", () => {
    const groups: GroupsType = {
      start: { 
        name: "Start", 
        titleEn: "Start", 
        titleFr: "Start", 
        elements: ["1"], 
        nextAction: [
          { choiceId: "1.0", groupId: "groupA" },
          { choiceId: "1.1", groupId: "groupB" }
        ]
      },
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [] },
      groupB: { name: "B", titleEn: "B", titleFr: "B", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    // Test first choice
    const valuesA: FormValues = { "1": "1.0" };
    const resultA = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesA,
      "start"
    );
    expect(resultA).toEqual(["start", "groupA"]);

    // Test second choice
    const valuesB: FormValues = { "1": "1.1" };
    const resultB = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesB,
      "start"
    );
    expect(resultB).toEqual(["start", "groupB"]);
  });

  it("handles conditional nextAction with no matching choice", () => {
    const groups: GroupsType = {
      start: { 
        name: "Start", 
        titleEn: "Start", 
        titleFr: "Start", 
        elements: ["1"], 
        nextAction: [
          { choiceId: "1.0", groupId: "groupA" },
          { choiceId: "1.1", groupId: "groupB" }
        ]
      },
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [] },
      groupB: { name: "B", titleEn: "B", titleFr: "B", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    // No matching choice ID
    const values: FormValues = { "1": "1.2" };
    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      values,
      "start"
    );
    expect(result).toEqual(["start"]);
  });

  it("handles conditional nextAction with missing element value", () => {
    const groups: GroupsType = {
      start: { 
        name: "Start", 
        titleEn: "Start", 
        titleFr: "Start", 
        elements: ["1"], 
        nextAction: [
          { choiceId: "1.0", groupId: "groupA" }
        ]
      },
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    // Element 1 has no value
    const values: FormValues = {};
    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      values,
      "start"
    );
    expect(result).toEqual(["start"]);
  });

  it("handles complex multi-level navigation", () => {
    const groups: GroupsType = {
      start: { 
        name: "Start", 
        titleEn: "Start", 
        titleFr: "Start", 
        elements: ["1"], 
        nextAction: [
          { choiceId: "1.0", groupId: "pathA" },
          { choiceId: "1.1", groupId: "pathB" }
        ]
      },
      pathA: { 
        name: "Path A", 
        titleEn: "Path A", 
        titleFr: "Path A", 
        elements: ["2"], 
        nextAction: "finalA"
      },
      pathB: { 
        name: "Path B", 
        titleEn: "Path B", 
        titleFr: "Path B", 
        elements: ["3"], 
        nextAction: [
          { choiceId: "3.0", groupId: "finalB1" },
          { choiceId: "3.1", groupId: "finalB2" }
        ]
      },
      finalA: { name: "Final A", titleEn: "Final A", titleFr: "Final A", elements: [] },
      finalB1: { name: "Final B1", titleEn: "Final B1", titleFr: "Final B1", elements: [] },
      finalB2: { name: "Final B2", titleEn: "Final B2", titleFr: "Final B2", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    // Test path A
    const valuesA: FormValues = { "1": "1.0" };
    const resultA = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesA,
      "start"
    );
    expect(resultA).toEqual(["start", "pathA", "finalA"]);

    // Test path B with first sub-choice
    const valuesB1: FormValues = { "1": "1.1", "3": "3.0" };
    const resultB1 = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesB1,
      "start"
    );
    expect(resultB1).toEqual(["start", "pathB", "finalB1"]);

    // Test path B with second sub-choice
    const valuesB2: FormValues = { "1": "1.1", "3": "3.1" };
    const resultB2 = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      valuesB2,
      "start"
    );
    expect(resultB2).toEqual(["start", "pathB", "finalB2"]);
  });

  it("handles groups with no nextAction", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [] }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      {},
      "start"
    );
    
    expect(result).toEqual(["start"]);
  });

  it("prevents infinite loops in circular navigation", () => {
    const groups: GroupsType = {
      start: { name: "Start", titleEn: "Start", titleFr: "Start", elements: [], nextAction: "groupA" },
      groupA: { name: "A", titleEn: "A", titleFr: "A", elements: [], nextAction: "groupB" },
      groupB: { name: "B", titleEn: "B", titleFr: "B", elements: [], nextAction: "start" }
    };
    
    const formRecord = {
      form: { groups }
    } as PublicFormRecord;

    const result = getVisibleGroupsBasedOnValuesRecursive(
      formRecord,
      {},
      "start"
    );
    
    // Should stop when it encounters 'start' again
    expect(result).toEqual(["start", "groupA", "groupB"]);
  });
});
