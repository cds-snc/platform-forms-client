import { describe, it, expect } from "vitest";
import { formNonElementValues, emptyForm, emptyFormRepeatingSet, nonEmptyFormSubPageValue, nonEmptyFormDateValue, nonEmptyFormCheckBoxValue, nonEmptyFormRepeatingSetValue } from "__fixtures__/formFillerFlattenStructureValues.json";
import { flattenStructureToValues, stripExcludedKeys } from "../helpers";


describe("stripExcludedKeys() test - Remove non-value keys from form values", () => {
  it("should remove non-value keys from form values object", () => {
    const expectedResult = {
      "3": "",
      "4": "",
      "5": [],
      "6": { name: null, size: null, content: null },
      "8": [ { "1": "", "2": "", "3": "" } ],
      "9": "",
      "10": "",
      "11": ""
    };
    const elementValues = stripExcludedKeys(formNonElementValues);
    expect(elementValues).toEqual(expectedResult);
  });
})

describe("flattenStructureToValues() test - Emty form", () => {
  it("should return a list of empty values for an empty form", () => {
    const expectedResult = ["",  "", null, null, null, "", "",  "", "",  "", ""];
    const elementValues = flattenStructureToValues(emptyForm);
    expect(elementValues).toEqual(expectedResult);
  });

  it("should return a empty list for an empty form with an added repeating set item", () => {
    const expectedResult = ["", "", null, null, null, "", "", "", "", "", "", "", "", ""];
    const elementValues = flattenStructureToValues(emptyFormRepeatingSet);
    expect(elementValues).toEqual(expectedResult);
  });
});

describe("flattenStructureToValues() test - Non-Empty form", () => {
  it("should return a non-empty list for a form with a group page with a value", () => {
    const expectedResult = ["1", "", null, null, null, "", "", "", "Page A", "", ""];
    const elementValues = flattenStructureToValues(nonEmptyFormSubPageValue);
    expect(elementValues).toEqual(expectedResult);
  });

  it("should return a non-empty list for a Date value", () => {
    const expectedResult = [ "", '{"YYYY":2022,"MM":12,"DD":2}', "", "", "", "", "", ""];
    const elementValues = flattenStructureToValues(nonEmptyFormDateValue);
    expect(elementValues).toEqual(expectedResult);
  });

  it("should return a non-empty list for a checkbox value", () => {
    const expectedResult = ["", "", "A", "B", "", "", "", "", "", ""];
    const elementValues = flattenStructureToValues(nonEmptyFormCheckBoxValue);
    expect(elementValues).toEqual(expectedResult);
  });

  it("should return a non-empty list for a repeating set value", () => {
    const expectedResult = ["", "",  "A", "B", "", "", "1", "",  "1", "", "", "",  ""];
    const elementValues = flattenStructureToValues(nonEmptyFormRepeatingSetValue);
    expect(elementValues).toEqual(expectedResult);
  });
});
