import { describe, expect, it } from "vitest";
import type { GroupsType } from "@gcforms/types";

import testForm from "@root/__fixtures__/branchingCycleTest.json";
import { createsNextActionCycle } from "./validateGroups";

describe("createsNextActionCycle", () => {
  it("detects a proposed page destination that would create a branching loop", () => {
    const groups = testForm.groups as GroupsType;

    expect(createsNextActionCycle(groups, "cycle-c", "end")).toBe(false);
    expect(createsNextActionCycle(groups, "cycle-c", "cycle-a")).toBe(true);
  });
});
