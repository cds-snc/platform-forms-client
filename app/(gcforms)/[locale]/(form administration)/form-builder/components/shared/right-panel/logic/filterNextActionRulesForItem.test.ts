import { describe, expect, it } from "vitest";

import { filterNextActionRulesForItem } from "./filterNextActionRulesForItem";

describe("filterNextActionRulesForItem", () => {
  it("removes stale rules that belong to a different question", () => {
    expect(
      filterNextActionRulesForItem(31, [
        { groupId: "exit", choiceId: "26.1" },
        { groupId: "residency", choiceId: "26.0" },
        { groupId: "waitlistRegistration", choiceId: "31.0" },
        { groupId: "review", choiceId: "31.1" },
      ])
    ).toEqual([
      { groupId: "waitlistRegistration", choiceId: "31.0" },
      { groupId: "review", choiceId: "31.1" },
    ]);
  });

  it("keeps catch-all rules for the current question", () => {
    expect(
      filterNextActionRulesForItem(31, [
        { groupId: "review", choiceId: "31.catch-all" },
        { groupId: "exit", choiceId: "26.catch-all" },
      ])
    ).toEqual([{ groupId: "review", choiceId: "31.catch-all" }]);
  });
});