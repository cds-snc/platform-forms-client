import { extractSubElementId } from "../validation";
import { dynamicRowData as dynForm } from "./testData";

const mockDynaRowFormRes = {
  3: [
    {
      0: "Artisti",
    },
  ],
  7: [
    {
      0: "test1",
      1: "test@cds-snc.ca",
    },
  ],
  12: [
    {
      0: "",
      1: "",
      2: "",
      4: {
        file: null,
        src: null,
        name: "",
        size: 0,
      },
      5: {
        file: null,
        src: null,
        name: "",
        size: 0,
      },
      6: "",
      7: {
        file: null,
        src: null,
        name: "",
        size: 0,
      },
      8: {
        file: null,
        src: null,
        name: "",
        size: 0,
      },
      9: "",
    },
  ],
};

test("Should have a property type subId", () => {
  const elem = dynForm.formConfig.elements.find((element) => element.id === 3);
  expect(elem.properties.subElements.find((subElem) => subElem.id === 4)).toHaveProperty("subId");
});

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