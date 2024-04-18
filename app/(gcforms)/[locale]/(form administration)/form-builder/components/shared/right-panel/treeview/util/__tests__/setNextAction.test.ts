import { setNextAction } from "../setNextAction";

describe("Sets next action", () => {
  it("Sets next action for each group", () => {
    const formGroups = {
      "1": { name: "1", elements: ["1","2"], nextAction: "" },
      "2": { name: "2", elements: [], nextAction: "" },
      "3": { name: "2", elements: [], nextAction: "" },
    };
    const result = setNextAction(formGroups);
    expect(result["1"].nextAction).toBe("2");
    expect(result["2"].nextAction).toBe("3");
    expect(result["1"].elements).toEqual(["1","2"]);
    expect(result["3"].nextAction).toBeUndefined();
  });
});

