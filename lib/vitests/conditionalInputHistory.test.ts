import { getGroupValues, removeNonFormValues, valuesOnlyInHistory } from "@lib/utils/form-builder/groupsHistory";
import {formOutputWithEmptyInput} from "../../__fixtures__/conditionalInputHistorySimple.json";


// TODO test with dental form data

// TODO
//valuesOnlyInHistory
//removeNonFormValues()


describe("Conditional History", () => {
  it("Simple form case with some empty inputs", () => {
    const {formValues, groupHistory, groups} = formOutputWithEmptyInput;
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
    const values = valuesOnlyInHistory(
        formValues,
        getGroupValues(
          formValues,
          groups,
          groupHistory as string[]
        )
      );
    const formOnlyValues = removeNonFormValues(values);
    expect(formOnlyValues).toEqual(expectedOutput);
  });

  // it("Simple form case with some empty inputs invalid data should fail", () => {
  //   const {formValues, groups} = formOutputWithEmptyInput;
  //   const groupHistoryInvalid = [
  //     "start",
  //     "b3dec26b-dd19-4936-ad05-b2fbcbce929c",
  //     "e969496e-2fab-47e4-aa7f-5e51e0439369-INVALID",
  //     "review"
  //   ];
  //   const expectedOutputInvalid = {
  //     "1": "b",
  //     "2": "",
  //     "3": "",
  //     "4": "a1",
  //     "5": "",
  //     "6": ["checkbox-1", "checkbox-2"]
  //   };
  //   const values = valuesOnlyInHistory(
  //       formValues,
  //       getGroupValues(
  //         formValues,
  //         groups,
  //         groupHistoryInvalid as string[] // Group 5 is invalid and should be ignored
  //       )
  //     );
  //   const formOnlyValues = removeNonFormValues(values);
  //   expect(formOnlyValues).toEqual(expectedOutputInvalid);
  // });
});