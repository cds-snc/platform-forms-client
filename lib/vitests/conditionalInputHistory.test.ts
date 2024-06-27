import { getInputHistoryValues } from "@lib/utils/form-builder/groupsHistory";

// Fixtures captured by adding a break point in the form builder and copying the values from the debugger
import {values, groupHistory, groups} from "../../__fixtures__/conditionalInputHistoryEmptySimple.json";
import {values as valuesEntered, groupHistory as groupHistoryEntered, groups as groupsEntered} from "../../__fixtures__/conditionalInputHistoryEnteredSimple.json";
import {values as valuesComplex, groupHistory as groupHistoryComplex, groups as groupsComplex} from "../../__fixtures__/conditionalInputHistoryComplex.json";

describe("Conditional History", () => {
  it("Handles a simple case with no questions answered", () => {
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
    const formOnlyValues = getInputHistoryValues(values, groupHistory, groups);
    expect(formOnlyValues).toEqual(expectedOutput);
  });

  it("Handles a simple case with all questions answered", () => {
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
    const formOnlyValues = getInputHistoryValues(valuesEntered, groupHistoryEntered, groupsEntered);
    expect(formOnlyValues).toEqual(expectedOutput);
  });

  it("Handles a complex case", () => {
    const expectedOutput = {
      "3": "I am applying for myself",
      "4": "Yes",
      "5": "11/11/1977",
      "8": "1",
      "10": "1",
      "11": "1111111",
      "12": "Single",
      "14": "1",
      "15": "1",
      "17": "1",
      "18": "1",
      "19": "1",
      "20": "1",
      "22": "",
      "23": "",
      "24": "",
      "25": "",
      "26": "Canada",
      "27": "Yes",
      "29": "English",
      "30": "Email",
      "31": "1@1.com",
      "32": "1@1.com",
      "35": "",
      "36": "",
      "38": "Yes",
      "40": "Yes, I have federal benefits",
      "41": "Yes, I have provincial or territorial benefits",
      "43": "Non-Insured Health Benefits Program by Indigenous Services Canada",
      "44": "Alberta",
      "45": "Alberta Child Health Benefits",
      "46": "",
      "47": "",
      "48": "",
      "49": "",
      "50": "",
      "51": "",
      "52": "",
      "53": "",
      "54": "",
      "55": "",
      "56": "",
      "57": "",
      "62": "",
      "64": "",
      "65": "",
      "66": "",
      "67": ""
    };
    const formOnlyValues = getInputHistoryValues(valuesComplex, groupHistoryComplex, groupsComplex);
    expect(formOnlyValues).toEqual(expectedOutput);
  });
});
