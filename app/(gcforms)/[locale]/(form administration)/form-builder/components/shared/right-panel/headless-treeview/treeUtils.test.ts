import { createSafeDataLoader, getInitialTreeState } from "./treeUtils";

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

describe("createSafeDataLoader", () => {
  const treeData = {
    root: {
      data: { type: "root" },
      children: ["start"],
    },
    start: {
      data: { name: "Start", type: "group" },
      children: [1],
    },
    1: {
      data: { titleEn: "Question", type: "textField" },
      children: [],
    },
  };

  it("shares one tree data read across item and children lookups in the same task", () => {
    let calls = 0;
    const dataLoader = createSafeDataLoader(() => {
      calls += 1;
      return treeData;
    });

    expect(dataLoader.getChildren("root")).toEqual(["start"]);
    expect(dataLoader.getItem("start")).toEqual({ name: "Start", type: "group" });
    expect(dataLoader.getChildren("start")).toEqual(["1"]);
    expect(dataLoader.getItem("1")).toEqual({ titleEn: "Question", type: "textField" });
    expect(calls).toBe(1);
  });

  it("refreshes the cached tree data after the current task", async () => {
    let calls = 0;
    const dataLoader = createSafeDataLoader(() => {
      calls += 1;
      return treeData;
    });

    dataLoader.getItem("start");
    expect(calls).toBe(1);

    await Promise.resolve();

    dataLoader.getItem("start");
    expect(calls).toBe(2);
  });
});
