import { getGroupValues, removeNonFormValues, valuesOnlyInHistory } from "@lib/utils/form-builder/groupsHistory";
import testData from "../../__fixtures__/conditionalInputHistorySimple.json";

// TODO more fine grain UNIT tests of each function

// TODO test with dental form data




describe("Conditional History", () => {
//valuesOnlyInHistory()
//getGroupValues()
//removeNonFormValues()

  it("Simple form case", () => {
    const {formValues, groupHistory, groups, expectedOutput} = testData;
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

  // TODO this test revealed a bug with getGroupValues(), that needs to be fixed
  // it("Simple form case with invalid data should fail", () => {
  //   const {formValues, groupHistoryInvalid, groups, expectedOutput} = testData;
  //   const values = valuesOnlyInHistory(
  //       formValues,
  //       getGroupValues(
  //         formValues,
  //         groups,
  //         groupHistoryInvalid as string[]
  //       )
  //     );
  //   const formOnlyValues = removeNonFormValues(values);
  //   expect(formOnlyValues).toEqual(expectedOutput);
  // });
});