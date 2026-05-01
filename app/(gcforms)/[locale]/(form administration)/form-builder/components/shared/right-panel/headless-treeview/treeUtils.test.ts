import { getInitialTreeState } from "./treeUtils";

describe("getInitialTreeState", () => {
  it("expands the root item so tree items render on first load", () => {
    expect(getInitialTreeState()).toEqual({
      expandedItems: ["root"],
      selectedItems: [],
    });
  });

  it("preserves the selected item while keeping the root expanded", () => {
    expect(getInitialTreeState("start")).toEqual({
      expandedItems: ["root"],
      selectedItems: ["start"],
    });
  });
});