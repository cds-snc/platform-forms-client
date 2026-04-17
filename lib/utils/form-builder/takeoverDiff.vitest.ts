import { describe, expect, it } from "vitest";
import { buildTakeoverDiffRows, shouldRenderTakeoverDiffInline } from "./takeoverDiff";

describe("takeoverDiff", () => {
  it("pairs modified lines side by side", () => {
    const rows = buildTakeoverDiffRows({
      before: ['{', '  "name": "Before"', "}"].join("\n"),
      after: ['{', '  "name": "After"', "}"].join("\n"),
      createdAt: Date.now(),
    });

    expect(rows).toEqual([
      {
        type: "equal",
        leftLineNumber: 1,
        rightLineNumber: 1,
        leftText: "{",
        rightText: "{",
      },
      {
        type: "remove",
        leftLineNumber: 2,
        rightLineNumber: null,
        leftText: '  "name": "Before"',
        rightText: "",
      },
      {
        type: "add",
        leftLineNumber: null,
        rightLineNumber: 2,
        leftText: "",
        rightText: '  "name": "After"',
      },
      {
        type: "equal",
        leftLineNumber: 3,
        rightLineNumber: 3,
        leftText: "}",
        rightText: "}",
      },
    ]);
  });

  it("collapses distant unchanged rows into skipped markers", () => {
    const rows = buildTakeoverDiffRows(
      {
        before: ["a", "b", "c", "d", "e", "f", "g"].join("\n"),
        after: ["a", "b", "c", "changed", "e", "f", "g"].join("\n"),
        createdAt: Date.now(),
      },
      1
    );

    expect(rows).toEqual([
      {
        type: "skipped",
        count: 2,
      },
      {
        type: "equal",
        leftLineNumber: 3,
        rightLineNumber: 3,
        leftText: "c",
        rightText: "c",
      },
      {
        type: "remove",
        leftLineNumber: 4,
        rightLineNumber: null,
        leftText: "d",
        rightText: "",
      },
      {
        type: "add",
        leftLineNumber: null,
        rightLineNumber: 4,
        leftText: "",
        rightText: "changed",
      },
      {
        type: "equal",
        leftLineNumber: 5,
        rightLineNumber: 5,
        leftText: "e",
        rightText: "e",
      },
      {
        type: "skipped",
        count: 2,
      },
    ]);
  });

  it("guards against rendering very large diffs inline", () => {
    const hugeLine = "x".repeat(1500);
    const before = Array.from({ length: 100 }, () => hugeLine).join("\n");
    const after = Array.from({ length: 100 }, () => `${hugeLine} changed`).join("\n");

    expect(
      shouldRenderTakeoverDiffInline({
        before,
        after,
        createdAt: Date.now(),
      })
    ).toBe(false);
  });
});
