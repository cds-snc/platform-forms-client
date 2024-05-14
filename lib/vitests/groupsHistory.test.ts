import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { getGroupHistory, addGroupHistory, removeGroupHistory } from "@lib/utils/form-builder/groupsHistory";

const defaultHistory:string[] = [
  LockedSections.START,
  "group1",
  "group2",
  "group3",
  "group4",
  "group5",
];

describe("getGroupHistory tests", () => {
  const history:string[] = [...defaultHistory];

  it("handles invalid input", () => {
    // @ts-expect-error - testing invalid input
    const result = getGroupHistory("INVALID");
    expect(result.length).toEqual(1);
    expect(result[0]).toEqual(LockedSections.START);
  });

  it("gets history", () => {
    expect(getGroupHistory(history).length).toEqual(6);
  });
});


describe("addGroupHistory tests", () => {
  let history:string[] = [...defaultHistory];

  it("handles invalid input", () => {
    // @ts-expect-error - testing invalid input
    expect(addGroupHistory("INVALID", "INVALID").length).toEqual(1);
  });

  it("adds history", () => {
    history = addGroupHistory("group6", history);
    history = addGroupHistory("group7", history);
    history = addGroupHistory("group8", history);
    history = addGroupHistory("group9", history);
    history = addGroupHistory("group10", history);
    expect(history.length).toEqual(11);
    expect(history[6]).toEqual("group6");
    expect(history[10]).toEqual("group10");
  });
});

describe("removeGroupHistory tests", () => {
  let history:string[] = [...defaultHistory];

  it("handles invalid input", () => {
    // @ts-expect-error - testing invalid input
    expect(removeGroupHistory("INVALID", "INVALID").length).toEqual(1);
  });

  it("removes/sets history in the middle", () => {
    history = removeGroupHistory("group3", history);
    expect(history.length).toEqual(4);
  });

  it("removes/sets history at the end", () => {
    history = removeGroupHistory("group3", history);
    expect(history.length).toEqual(4);
  });
});
