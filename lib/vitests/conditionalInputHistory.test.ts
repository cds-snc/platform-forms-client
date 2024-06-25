import { getGroupValues, removeNonFormValues, valuesOnlyInHistory } from "@lib/utils/form-builder/groupsHistory";
import {formOutputWithEmptyInput, formOutputWithEnteredInput} from "../../__fixtures__/conditionalInputHistorySimple.json";

// TODO test with dental form data

// Tests the composition of util methods to get the final conditional history result
// Like an integration tests for unit tests :)

describe("Conditional History", () => {
  it("Simple case: no questions answered", () => {
    const {values, groupHistory, groups} = formOutputWithEmptyInput;
    const expectedOutput = {
      "1": "A",
      "2": [],
      "3": "",
      "4": "",
      "5": "a1",
      "6": "a2",
      "7": "",
      "8": "",
      "9": "",
      "10": "",
      "11": "",
      "12": "",
      "13": [],
      "14": "",
      "15": ""
  };
    const formValues = valuesOnlyInHistory(
        values,
        getGroupValues(
          values,
          groups,
          groupHistory as string[]
        )
      );
    const formOnlyValues = removeNonFormValues(formValues);
    expect(formOnlyValues).toEqual(expectedOutput);
  });

  it("Simple case: all questions answered", () => {
    const {values, groupHistory, groups} = formOutputWithEnteredInput;
    const expectedOutput = {
        "1": "A",
        "2": [ "1", "2", "3"],
        "3": "1",
        "4": "longanswer",
        "5": "a1",
        "6": "a2",
        "7": "",    // empty since not in group history "path"
        "8": "",    // empty since not in group history "path"
        "9": "",    // empty since not in group history "path"
        "10": "",   // empty since not in group history "path"
        "11": "01/01/2024",
        "12": "Accessibility Standards Canada",
        "13": [ "1", "2", "3"],
        "14": "1",
        "15": "Ottawa",
    };
    const formValues = valuesOnlyInHistory(
        values,
        getGroupValues(
          values,
          groups,
          groupHistory as string[]
        )
      );
    const formOnlyValues = removeNonFormValues(formValues);
    expect(formOnlyValues).toEqual(expectedOutput);
  });
});