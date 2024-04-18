import { setGroupNextAction } from "../setNextAction";

describe("Sets next action for a specific group", () => {
  it("Sets next action for a specific group", () => {
    const formGroups = {
      "1": { name: "1", elements: ["1", "2"], nextAction: "" },
      "2": { name: "2", elements: [], nextAction: "" },
      "3": { name: "3", elements: [], nextAction: [{ groupId: "2", choiceId: "1.0" }] },
      "4": { name: "4", elements: [] },
      "5": { name: "5", elements: [] },
    };
    const result = setGroupNextAction(formGroups, "1", "2");

    expect(result["1"].nextAction).toBe("2");
  });
});