import { describe, expect, it, vi } from "vitest";
import { syncFormContextValues } from "./useValueChanged";

describe("syncFormContextValues", () => {
  it("synchronizes all context values on the first render", () => {
    const setFieldValue = vi.fn();
    const nextValues = {
      currentGroup: "start",
      groupHistory: ["start"],
      matchedIds: ["1.0"],
    };

    const result = syncFormContextValues(setFieldValue, undefined, nextValues);

    expect(result).toBe(nextValues);
    expect(setFieldValue.mock.calls).toEqual([
      ["currentGroup", "start"],
      ["groupHistory", ["start"]],
      ["matchedIds", ["1.0"]],
    ]);
  });

  it("only synchronizes context values that changed", () => {
    const setFieldValue = vi.fn();
    const previousValues = {
      currentGroup: "start",
      groupHistory: ["start"],
      matchedIds: ["1.0"],
    };
    const nextValues = {
      currentGroup: "next",
      groupHistory: ["start", "next"],
      matchedIds: ["1.1"],
    };

    syncFormContextValues(setFieldValue, previousValues, nextValues);

    expect(setFieldValue).toHaveBeenCalledTimes(3);
    expect(setFieldValue).toHaveBeenCalledWith("currentGroup", "next");
    expect(setFieldValue).toHaveBeenCalledWith("groupHistory", ["start", "next"]);
    expect(setFieldValue).toHaveBeenCalledWith("matchedIds", ["1.1"]);
  });

  it("does not write equivalent derived values back into Formik", () => {
    const setFieldValue = vi.fn();
    const previousValues = {
      currentGroup: "start",
      groupHistory: ["start"],
      matchedIds: ["1.0"],
    };
    const nextValues = {
      currentGroup: "start",
      groupHistory: ["start"],
      matchedIds: ["1.0"],
    };

    syncFormContextValues(setFieldValue, previousValues, nextValues);

    expect(setFieldValue).not.toHaveBeenCalled();
  });
});