import {
  decrementNextAction,
  decrementNextActionChoiceIds
} from "@lib/formContext";

describe("decrementNextAction tests", () => {
  it("Handles decrementing a next action", () => {

    // Should stay the same as 1.2 is the same as 1.2
    expect(decrementNextAction({ groupId: "b", choiceId: "1.2" }, "1.2")).toEqual({ groupId: "b", choiceId: "1.2" });

    // Should stay the same as 1.1 is less than 1.2
    expect(decrementNextAction({ groupId: "b", choiceId: "1.1" }, "1.2")).toEqual({ groupId: "b", choiceId: "1.1" });
    expect(decrementNextAction({ groupId: "b", choiceId: "1.0" }, "1.2")).toEqual({ groupId: "b", choiceId: "1.0" });

    // Should stay the same as the parent doesn't match
    expect(decrementNextAction({ groupId: "c", choiceId: "2.0" }, "1.2")).toEqual({ groupId: "c", choiceId: "2.0" });
    expect(decrementNextAction({ groupId: "c", choiceId: "2.1" }, "1.2")).toEqual({ groupId: "c", choiceId: "2.1" });

    // Should decrement
    expect(decrementNextAction({ groupId: "a", choiceId: "1.3" }, "1.2")).toEqual({ groupId: "a", choiceId: "1.2" });
    expect(decrementNextAction({ groupId: "a", choiceId: "1.7" }, "1.2")).toEqual({ groupId: "a", choiceId: "1.6" });
  });
});


describe("decrementNextActionChoiceIds tests", () => {
  it("Handles decrementing a set of next actions", () => {

    const groups = {
      "start": {
        "name": "Start",
        "titleEn": "Start page",
        "titleFr": "Start page",
        "elements": [
          "1"
        ],
        "nextAction": [
          {
            "groupId": "a",
            "choiceId": "1.0"
          },
          {
            "groupId": "b",
            "choiceId": "1.1"
          },
          {
            "groupId": "c",
            "choiceId": "1.2"
          }
        ]
      }
    };

    const expected = {
      "start": {
        "name": "Start",
        "titleEn": "Start page",
        "titleFr": "Start page",
        "elements": [
          "1"
        ],
        "nextAction": [
          {
            "groupId": "a",
            "choiceId": "1.0"
          },
          {
            "groupId": "c",
            "choiceId": "1.1"
          }
        ]
      }
    };

    expect(decrementNextActionChoiceIds(groups, "1.1")).toEqual(expected);
  });
});


