import { findParentGroup } from "../findParentGroup";
import TestForm from "../../../../../../../../../../../__fixtures__/testDataWithGroups.json";
import { groupsToTreeData } from "../groupsToTreeData";
import { FormElement } from "@lib/types";

const groups = groupsToTreeData(TestForm.groups, TestForm.elements as FormElement[]);

describe("Finds parent group using element id", () => {
  it("Returns undefined when element id is not found", () => {
    const parent = findParentGroup(groups, "100");
    expect(parent).toBeUndefined();
  });

  it("Finds parent using a valid element id", () => {
    const parent2 = findParentGroup(groups, "2");
    expect(parent2?.index).toBe("start");
    const parent4 = findParentGroup(groups, "4");
    expect(parent4?.index).toBe("9d1b6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed");
  });

  it("Returns undefined when group has no children", () => {
    const parent = findParentGroup([], "5");
    expect(parent).toBeUndefined();
  });

  it("Returns undefined when group is not an array", () => {
    // @ts-expect-error Testing invalid input
    const parent = findParentGroup(false, "5");
    expect(parent).toBeUndefined();
  });
});
