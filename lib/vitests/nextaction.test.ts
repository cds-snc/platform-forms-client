import { getNextAction } from "@lib/formContext";

describe("getNextAction function", () => {

  it("Gets next action when using a string value", () => {
    const groups = {
      "start": { name: "start", nextAction: "group1", elements: [] },
      "group1": { name: "group1", nextAction: "group2", elements: [] },
      "group2": { name: "group2", nextAction: "group3", elements: [] },
      "end": { name: "end", elements: [] }
    };

    expect(getNextAction(groups, "group1", [])).toBe("group2");
  });

  it("Gets next action when using a array value", () => {
    const groups = {
      "start": { name: "start", nextAction: "group1", elements: [] },
      "group1": {
        name: "group1", nextAction: [
          { "choiceId": "1.0", "groupId": "group2" },
          { "choiceId": "1.1", "groupId": "group3" }
        ], elements: []
      },
      "group2": { name: "group2", nextAction: "end", elements: [] },
      "group3": { name: "group3", nextAction: "end", elements: [] },
      "end": { name: "end", elements: [] }
    };

    expect(getNextAction(groups, "group1", ["1.0"])).toBe("group2");
    expect(getNextAction(groups, "group1", ["1.1"])).toBe("group3");
    expect(getNextAction(groups, "end", [])).toBe("");
  });
});