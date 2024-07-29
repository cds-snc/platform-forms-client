import { filterValuesForShownElements } from "@lib/formContext";
import { FormElement } from "@lib/types";

// Fixtures captured by adding a break point in Forms.tsx and copying the values from the debugger
import {elements, elementsShown} from "../../__fixtures__/filterValuesForShownElements.json";

describe("formContext filterValuesForShownElements()", () => {
  it("Handles filtering out correct element", () => {
    const expectedOutput = [
      "2",
      "3"
    ];
    const result = filterValuesForShownElements(elements, elementsShown as FormElement[]);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles bad input", () => {
    const expectedOutput = undefined;
    // @ts-expect-error - testing invalid input
    const result = filterValuesForShownElements();
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 1", () => {
    const expectedOutput = elements;
    // @ts-expect-error - testing invalid input
    const result = filterValuesForShownElements(elements, undefined);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 2", () => {
    const expectedOutput = undefined;
    // @ts-expect-error - testing invalid input
    const result = filterValuesForShownElements(undefined, elementsShown as FormElement[]);
    expect(result).toEqual(expectedOutput);
  });
});
