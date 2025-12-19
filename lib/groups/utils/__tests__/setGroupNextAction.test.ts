import { setGroupNextAction } from "../setNextAction";

describe("Sets next action for a specific group", () => {
  it("Sets next action for a specific group", () => {
    const formGroups = {
      "1": { name: "1", elements: ["1", "2"], nextAction: "", titleEn:"", titleFr:""},
      "2": { name: "2", elements: [], nextAction: "", titleEn:"", titleFr:"" },
      "3": { name: "3", elements: [], nextAction: [{ groupId: "2", choiceId: "1.0" }], titleEn:"", titleFr:"" },
      "4": { name: "4", elements: [], titleEn:"", titleFr:"" },
      "5": { name: "5", elements: [], titleEn:"", titleFr:"" },
    };
    const nextAction = setGroupNextAction(formGroups, "1", "2");
    expect(nextAction).toBe("2");

    // This should be untouched - as groupId is empty
    const nextActionArr = setGroupNextAction(formGroups, "1", [{ groupId: "", choiceId: "1.0" }]);
    expect(nextActionArr).toBe("");

    // Take the group id as the next action from the array when there is no choiceId
    const nextActionGroupAsString = setGroupNextAction(formGroups, "1", [{ groupId: "5", choiceId: "" }]);
    expect(nextActionGroupAsString).toBe("5");
  });
});