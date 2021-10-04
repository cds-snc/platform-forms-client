import { extractSubElementId } from "../validation";
import { dynamicRowData as dynForm } from "./testData";

test("Should return a valid sub element id 1", () => {
  const elem = dynForm.formConfig.elements.find((element) => element.id === 7);
  const subElem = elem.properties.subElements.find((subElem) => subElem.id === 9);
  expect(subElem).toHaveProperty("subId");
  expect(extractSubElementId(subElem) === 1);
});

test("Should thrown an exception invalid formElement", () => {
  expect(extractSubElementId).toThrow("Invalid formElement");
});

test("Should thrown an exception invalid id", () => {
  const elem = dynForm.formConfig.elements.find((element) => element.id === 12);
  expect(() => extractSubElementId(elem)).toThrow();
});
