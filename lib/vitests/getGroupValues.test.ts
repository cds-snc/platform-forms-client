import { getGroupValues } from "@lib/utils/form-builder/groupsHistory";
import {formOutputWithEmptyInput} from "../../__fixtures__/conditionalInputHistorySimple.json";

describe("getGroupValues function", () => {
  it("Gets correct values (only values related to groups with the questions answered)", () => {
    const {formValues, groupHistory, groups} = formOutputWithEmptyInput;
    const values = getGroupValues(
      formValues,
      groups,
      groupHistory as string[]
    );
    const expectedValues = {
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
    expect(values).toEqual(expectedValues);
  });

  it("Handles empty inputs", () => {
    // @ts-expect-error - testing invalid input
    const values = getGroupValues();
    const expectedValues = [] as string[];
    expect(values).toEqual(expectedValues);
  });

  it("Handles invalid group history (should never happen)", () => {
    const {formValues, groups} = formOutputWithEmptyInput;
    const groupHistoryInvalid = [
      "start",
      "1739f12e-abbd-46ae-9db6-1b4b2144080d",
      "5205bacd-da93-4325-832e-9ed4be6ab38d-INVALID",
      "review"
    ];
    const values = getGroupValues(
      formValues,
      groups,
      groupHistoryInvalid as string[]
    );
    const expectedValues = {
      "1": "A",
      "11": "",
      "12": "",
      "13": [],
      // "14": "",      // Related invalid group (A-S2 elements=[6,14]) - should be removed
      "15": "",
      "2": [],
      "3": "",
      "4": "",
      "5": "a1",
      //"6": "",        // Related invalid group (A-S2 elements=[6,14]) - should be removed
    };
    expect(values).toEqual(expectedValues);
  });
});