import { removeFormContext } from "@lib/utils/form-builder/groupsHistory";
import {values} from "../../__fixtures__/conditionalInputHistoryEmptySimple.json";

describe("onlyRelevantValues function", () => {
  it("Combines group history answers with empty unanswered questions", () => {
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
    const formValues = removeFormContext(values, groupValues);
    expect(formValues).toEqual(expectedOutput);
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
    const formValues = removeFormContext(null, groupValues);
    expect(formValues).toEqual(expectedOutput);
  });

  it("Handles empty groupValues input", () => {
    const expectedOutput = {};
    // @ts-expect-error - testing invalid input
    const formValues = removeFormContext(values, null);
    expect(formValues).toEqual(expectedOutput);
  });

  it("Handles empty input", () => {
    const expectedOutput = {};
    // @ts-expect-error - testing invalid input
    const formValues = removeFormContext();
    expect(formValues).toEqual(expectedOutput);
  });
});
