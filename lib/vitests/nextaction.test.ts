import { getNextAction } from "@lib/formContext";

describe("getNextAction function", () => {

  it("Gets next action when using a string value", () => {
    const groups = {
      "start": { name: "start", titleEn: "", titleFr: "", nextAction: "group1", elements: [] },
      "group1": { name: "group1", titleEn: "", titleFr: "", nextAction: "group2", elements: [] },
      "group2": { name: "group2", titleEn: "", titleFr: "", nextAction: "group3", elements: [] },
      "end": { name: "end", titleEn: "", titleFr: "", elements: [] }
    };

    expect(getNextAction(groups, "group1", [])).toBe("group2");
  });

  it("Gets next action when using a array value", () => {
    const groups = {
      "start": { name: "start", titleEn: "", titleFr: "", nextAction: "group1", elements: [] },
      "group1": {
        name: "group1", titleEn: "", titleFr: "", nextAction: [
          { "choiceId": "1.0", "groupId": "group2" },
          { "choiceId": "1.1", "groupId": "group3" }
        ], elements: []
      },
      "group2": { name: "group2", titleEn: "", titleFr: "", nextAction: "end", elements: [] },
      "group3": { name: "group3", titleEn: "", titleFr: "", nextAction: "end", elements: [] },
      "end": { name: "end", titleEn: "", titleFr: "", elements: [] }
    };

    expect(getNextAction(groups, "group1", ["1.0"])).toBe("group2");
    expect(getNextAction(groups, "group1", ["1.1"])).toBe("group3");
    expect(getNextAction(groups, "end", [])).toBe("");
  });

  it("Gets next action catch-all value", () => {

    const groups = {
      "start": { name: "start", titleEn: "", titleFr: "", nextAction: "group1", elements: [] },
      "group1": {
        name: "group1", titleEn: "", titleFr: "", nextAction: [
          { "choiceId": "1.0", "groupId": "group2" },
          { "choiceId": "1.catch-all", "groupId": "group3" }
        ], elements: []
      },
      "group2": { name: "group2", titleEn: "", titleFr: "", nextAction: "end", elements: [] },
      "group3": { name: "group3", titleEn: "", titleFr: "", nextAction: "end", elements: [] },
      "end": { name: "end", titleEn: "", titleFr: "", elements: [] }
    };

    expect(getNextAction(groups, "group1", ["1.0"])).toBe("group2");
    expect(getNextAction(groups, "group1", ["1.1"])).toBe("group3");
  });
});