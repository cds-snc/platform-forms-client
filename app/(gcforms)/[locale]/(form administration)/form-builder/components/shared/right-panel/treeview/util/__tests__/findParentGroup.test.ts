import { findParentGroup } from "../findParentGroup";

const groups = [
  {
    id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    name: "Group 1",
    readOnly: false,
    icon: null,
    children: [
      {
        id: "2",
        name: "Child 1",
        readOnly: false,
        icon: null,
      },
    ],
  },
  {
    id: "9d1b6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
    name: "Group 2",
    readOnly: false,
    icon: null,
    children: [
      {
        id: "4",
        name: "Child 2",
        readOnly: false,
        icon: null,
      },
      {
        id: "4",
        name: "Child 2",
        readOnly: false,
        icon: null,
      },
    ],
  },
];

describe("Finds parent group using element id", () => {
  it("Returns undefined when element id is not found", () => {
    const parent = findParentGroup(groups, "5");
    expect(parent).toBeUndefined();
  });

  it("Finds parent using a valid element id", () => {
    const parent2 = findParentGroup(groups, "2");
    expect(parent2?.id).toBe("1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed");
    const parent4 = findParentGroup(groups, "4");
    expect(parent4?.id).toBe("9d1b6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed");
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
