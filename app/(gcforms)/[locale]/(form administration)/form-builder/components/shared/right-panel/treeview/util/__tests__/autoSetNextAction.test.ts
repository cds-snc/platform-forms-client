import { autoFlowAllNextActions } from "../setNextAction";

describe("Sets next action", () => {
  it("Sets next action for each group", () => {
    const formGroups = {
      "1": { name: "1", elements: ["1", "2"], nextAction: "", titleEn:"", titleFr:"" },
      "2": { name: "2", elements: [], nextAction: "", titleEn:"", titleFr:"" },
      "3": { name: "3", elements: [], nextAction: [{ groupId: "2", choiceId: "1.0" }], titleEn:"", titleFr:"" },
      "4": { name: "4", elements: [], titleEn:"", titleFr:"" },
      "5": { name: "5", elements: [], titleEn:"", titleFr:"" },
    };
    const result = autoFlowAllNextActions(formGroups);

    expect(result["1"].nextAction).toBe("2");
    expect(result["1"].elements).toEqual(["1", "2"]);

    expect(result["2"].nextAction).toBe("3");

    // This should be untouched
    expect(result["3"].nextAction).toEqual([{ groupId: "2", choiceId: "1.0" }]);

    // This should be untouched as nothing comes after it
    expect(result["5"].nextAction).toBeUndefined();
  });
});
