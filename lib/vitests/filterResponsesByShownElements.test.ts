import { expect } from 'vitest'
import { filterResponsesByShownElements } from "@lib/formContext";
import { FormElement } from "@lib/types";

// Fixtures captured by adding a break point in Forms.tsx and copying the values from the debugger
import {inputHistoryValues, shownElements} from "../../__fixtures__/filterResponsesByShownElements.json";

describe("formContext filterResponsesByShownElements()", () => {
  it("Handles filtering out correct element", () => {
    const expectedOutput = {
      "1": "A",
      "2": "A",
      "3": "P1-Q1-A",
      // "4": "",
      "5": "",
      "6": "",
      // "7": "",
      "8": "",
      "9": "",
      // "10": "",
      // "currentGroup": "",
      // "groupHistory": "",
      // "matchedIds": ""
    };
    const result = filterResponsesByShownElements(inputHistoryValues, shownElements as FormElement[]);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles bad input", () => {
    const expectedOutput = undefined;
    // @ts-expect-error - testing invalid input
    const result = filterResponsesByShownElements();
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 1", () => {
    const expectedOutput = inputHistoryValues;
    // @ts-expect-error - testing invalid input
    const result = filterResponsesByShownElements(inputHistoryValues, undefined);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 2", () => {
    const expectedOutput = undefined;
    // @ts-expect-error - testing invalid input
    const result = filterResponsesByShownElements(undefined, shownElements as FormElement[]);
    expect(result).toEqual(expectedOutput);
  });
});
