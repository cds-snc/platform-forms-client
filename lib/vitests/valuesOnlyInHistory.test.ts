import { valuesOnlyInHistory } from "@lib/utils/form-builder/groupsHistory";
import {formOutputWithEmptyInput} from "../../__fixtures__/conditionalInputHistorySimple.json";

describe("valuesOnlyInHistory function", () => {
  it("Combines group history answers with empty unanswered questions", () => {
    const {formValues} = formOutputWithEmptyInput;
    const groupValues = {
      "1": "A",
      "11": "",
      "12": "",
      "13": [],
      "14": "",
      "15": "",
      "2": [],
      "3": "",
      "4": "",
      "5": "a1",
      "6": "a2",
    }
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
      "15": "",
      "currentGroup": "",
      "groupHistory": "",
    };
    const values = valuesOnlyInHistory(formValues, groupValues);
    expect(values).toEqual(expectedOutput);
  });

  it("Handles empty formValues input", () => {
    const groupValues = {
      "1": "A",
      "11": "",
      "12": "",
      "13": [],
      "14": "",
      "15": "",
      "2": [],
      "3": "",
      "4": "",
      "5": "a1",
      "6": "a2",
    }
    const expectedOutput = {};
    // @ts-expect-error - testing invalid input
    const values = valuesOnlyInHistory(null, groupValues);
    expect(values).toEqual(expectedOutput);
  });

  it("Handles empty groupValues input", () => {
    const {formValues} = formOutputWithEmptyInput;
    const expectedOutput = {};
    // @ts-expect-error - testing invalid input
    const values = valuesOnlyInHistory(formValues, null);
    expect(values).toEqual(expectedOutput);
  });

  it("Handles empty input", () => {
    const expectedOutput = {};
    // @ts-expect-error - testing invalid input
    const values = valuesOnlyInHistory();
    expect(values).toEqual(expectedOutput);
  });
});