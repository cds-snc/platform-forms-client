import {
  decrementNextAction,
  // decrementNextActionChoiceIds
} from "@lib/formContext";



describe("decrementNextAction tests", () => {
  it("Handles decrementing a next action", () => {

    // Should decrement
    expect(decrementNextAction({ groupId: "a", choiceId: "1.3" }, "1.2")).toEqual({ groupId: "a", choiceId: "1.2" });
    // Should stay the same as 1.2 is the same as 1.2
    expect(decrementNextAction({ groupId: "b", choiceId: "1.2" }, "1.2")).toEqual({ groupId: "b", choiceId: "1.2" });

    // Should stay the same as 1.1 is less than 1.2
    expect(decrementNextAction({ groupId: "b", choiceId: "1.1" }, "1.2")).toEqual({ groupId: "b", choiceId: "1.1" });
    expect(decrementNextAction({ groupId: "b", choiceId: "1.0" }, "1.2")).toEqual({ groupId: "b", choiceId: "1.0" });

    // Should stay the same as the parent doesn't match
    expect(decrementNextAction({ groupId: "c", choiceId: "2.0" }, "1.2")).toEqual({ groupId: "c", choiceId: "2.0" });
    expect(decrementNextAction({ groupId: "c", choiceId: "2.1" }, "1.2")).toEqual({ groupId: "c", choiceId: "2.1" });
  });
});