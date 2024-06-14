import { LockedSections } from "@formBuilder/components/shared/right-panel/treeview/types";
import { getGroupHistory, pushIdToHistory, clearHistoryAfterId, getPreviousIdFromCurrentId } from "@lib/utils/form-builder/groupsHistory";

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
    expect(pushIdToHistory("INVALID", "INVALID").length).toEqual(1);
  });

  it("adds history", () => {
    history = pushIdToHistory("group6", history);
    history = pushIdToHistory("group7", history);
    history = pushIdToHistory("group8", history);
    history = pushIdToHistory("group9", history);
    history = pushIdToHistory("group10", history);
    expect(history.length).toEqual(11);
    expect(history[6]).toEqual("group6");
    expect(history[10]).toEqual("group10");
  });
});

describe("removeGroupHistory tests", () => {
  let history:string[] = [...defaultHistory];

  it("handles invalid input", () => {
    // @ts-expect-error - testing invalid input
    expect(clearHistoryAfterId("INVALID", "INVALID").length).toEqual(1);
  });

  it("removes/sets history in the middle", () => {
    history = clearHistoryAfterId("group3", history);
    expect(history.length).toEqual(4);
  });

  it("removes/sets history at the end", () => {
    history = clearHistoryAfterId("group3", history);
    expect(history.length).toEqual(4);
  });
});

describe("getPreviousIdFromCurrentId tests", () => {
  const history:string[] = [...defaultHistory];

  it("handles an invalid id", () => {
    expect(getPreviousIdFromCurrentId("INVALID", history)).toEqual(null);
  });

  it("returns nothing at start of history", () => {
    expect(getPreviousIdFromCurrentId(LockedSections.START, history)).toEqual(null);
  });

  it("returns previous Id around middle of history", () => {
    expect(getPreviousIdFromCurrentId("group3", history)).toEqual("group2");
  });

  it("returns previous Id at end of history", () => {
    expect(getPreviousIdFromCurrentId("group5", history)).toEqual("group4");
  });
});
