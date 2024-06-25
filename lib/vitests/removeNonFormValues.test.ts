import { removeNonFormValues } from "@lib/utils/form-builder/groupsHistory";
import {values} from "../../__fixtures__/conditionalInputHistoryEmptySimple.json";

describe("removeNonFormValues function", () => {
  it("Removes any values not related to user input form values", () => {
    const formValues = removeNonFormValues(values);
    const expectedValues = {
      "1": "A",
      "2": [],
      "3": "",
      "4": "",
      "5": "a1",
      "6": "a2",
      "7": "b1",
      "8": "b2",
      "9": "c1",
      "10": "c2",
      "11": "",
      "12": "",
      "13": [],
      "14": "",
      "15": ""
    }
    expect(formValues).toEqual(expectedValues);
  });

  it("Handles empty inputs", () => {
    // @ts-expect-error - testing invalid input
    const formValues = removeNonFormValues();
    const expectedValues = {};
    expect(formValues).toEqual(expectedValues);
  });
});