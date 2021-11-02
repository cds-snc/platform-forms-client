import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "../validation";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

function getFormMetaData(type, textType, required = false) {
  return {
    formConfig: {
      elements: [
        {
          id: 1,
          type: type,
          properties: {
            validation: {
              type: textType,
              required: required,
            },
          },
        },
      ],
    },
    t: (key) => key,
  };
}

// Test cases
/*
{
  fieldType: e.g. "textField"
  subType: for components like textField that have a type property
  passConditions: [],
  failConditions: [].
  expectedError: {1: "error string"}
  required: bool (optional),
}
*/
const testCases = [
  // text field validation
  {
    fieldType: "textField",
    subType: "",
    passConditions: [],
    failConditions: [{ 1: "" }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "textField",
    subType: "alphanumeric",
    passConditions: [{ 1: "Joe Pine" }, { 1: "JoePine" }],
    failConditions: [{ 1: "Joe % Pine" }, { 1: "Joe&Pine" }],
    expectedError: { 1: "input-validation.alphanumeric" },
  },
  {
    fieldType: "textField",
    subType: "email",
    passConditions: [{ 1: "joe.pine@cedar.com" }],
    failConditions: [{ 1: "joe.pine.com" }],
    expectedError: { 1: "input-validation.email" },
  },
  {
    fieldType: "textField",
    subType: "number",
    passConditions: [{ 1: "1" }, { 1: "4" }],
    failConditions: [{ 1: "two" }, { 1: "four" }],
    expectedError: { 1: "input-validation.number" },
  },
  {
    fieldType: "textField",
    subType: "date",
    passConditions: [{ 1: "06/05/1950" }],
    failConditions: [{ 1: "25/05/1950" }],
    expectedError: { 1: "input-validation.date" },
  },
  {
    fieldType: "textField",
    subType: "phone",
    passConditions: [{ 1: "1-819-555-7777" }],
    failConditions: [{ 1: "888-8989" }],
    expectedError: { 1: "input-validation.phone" },
  },
  // required validation for other components
  {
    fieldType: "textArea",
    passConditions: [],
    failConditions: [{ 1: "" }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "dropdown",
    passConditions: ["myChoice"],
    failConditions: [{ 1: undefined }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "radio",
    passConditions: ["myChoice"],
    failConditions: [{ 1: undefined }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "checkbox",
    passConditions: ["myChoice1", "myChoice2"],
    failConditions: [{ 1: undefined }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "fileInput",
    passConditions: [
      {
        file: new File([""], "fileName", { type: "application/pdf" }),
        src: null,
        name: "",
        size: 0,
      },
    ],
    failConditions: [{ 1: { file: null, src: null, name: "", size: 0 } }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "fileInput",
    passConditions: [
      {
        file: new File([""], "fileName", { type: "application/pdf" }),
        src: null,
        name: "",
        size: 8000000,
      },
    ],
    failConditions: [
      {
        1: {
          file: new File([""], "fileName", { type: "application/pdf" }),
          src: null,
          name: "",
          size: 8000001,
        },
      },
    ],
    expectedError: { 1: "input-validation.file-size-too-large" },
    required: true,
  },
  {
    fieldType: "fileInput",
    passConditions: [
      {
        file: new File([""], "fileName", { type: "application/pdf" }),
        src: null,
        name: "",
        size: 0,
      },
    ],
    failConditions: [
      {
        1: {
          file: new File([""], "fileName", { type: "application/fake" }),
          src: null,
          name: "",
          size: 0,
        },
      },
    ],
    expectedError: { 1: "input-validation.file-type-invalid" },
    required: true,
  },
];

describe("Test input validation", () => {
  test.each(testCases)(
    "$fieldType, $subType",
    ({ fieldType, subType, passConditions, failConditions, expectedError, required }) => {
      const props = getFormMetaData(
        fieldType,
        subType ? subType : undefined,
        required ? required : false
      );
      passConditions.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).not.toMatchObject(expectedError);
      });
      failConditions.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject(expectedError);
      });
    }
  );

  describe("DynamicRow element tests", () => {
    const formConfig = {
      elements: [
        {
          id: 0,
          type: "dynamicRow",
          properties: {
            titleEn: "",
            titleFr: "",
            validation: {
              required: true,
            },
            subElements: [
              {
                id: 1,
                type: "richText",
                properties: {
                  charLimit: 5000,
                  validation: {
                    required: false,
                  },
                  descriptionEn:
                    "You can add another representative, up to three, by clicking 'add row' below.",
                  descriptionFr:
                    "[FR] - You can add another representative, up to three, by clicking 'add row' below.",
                },
                subId: "7.0.0",
              },
              {
                id: 2,
                type: "textField",
                properties: {
                  titleEn: "Name of Representative",
                  titleFr: "[fr] Name of Representative",
                  charLimit: 100,
                  validation: {
                    type: "text",
                    required: true,
                  },
                  description: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
                subId: "7.0.1",
              },
              {
                id: 3,
                type: "richText",
                properties: {
                  charLimit: 5000,
                  validation: {
                    required: false,
                  },
                  descriptionEn:
                    "You can add another representative, up to three, by clicking 'add row' below.",
                  descriptionFr:
                    "[FR] - You can add another representative, up to three, by clicking 'add row' below.",
                },
                subId: "7.0.2",
              },
              {
                id: 4,
                type: "textField",
                properties: {
                  titleEn: "Email Address of Representative",
                  titleFr: "[fr] Email Address of Representative",
                  charLimit: 100,
                  validation: {
                    type: "text",
                    required: true,
                  },
                  description: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
                subId: "7.0.3",
              },
            ],
          },
        },
      ],
    };
    test("validates dynamic row correctly", () => {
      const errors = validateOnSubmit(
        {
          0: [
            { 1: "", 3: "" },
            { 1: "", 3: "" },
          ],
        },
        { formConfig, t: (key) => key }
      );
      console.log(errors);
      expect(errors).toMatchObject({
        7: [
          {
            1: "input-validation.required",
            3: "input-validation.required",
          },
        ],
      });
    });
  });
  test("Value not in elements", () => {
    const props = getFormMetaData("textField", "", undefined, true);
    const values = { 4: "test value" };
    const errors = validateOnSubmit(values, props);
    expect(errors).not.toHaveProperty("4");
  });
});

describe("Test getErrorList function", () => {
  afterEach(cleanup);
  const props = {
    touched: true,
    errors: {
      1: "input-validation.required",
      2: "input-validation.phone",
    },
  };
  test("Error list renders", () => {
    const errors = getErrorList(props);
    render(errors);
    expect(screen.getByText("input-validation.required"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-link");
    expect(screen.getByText("input-validation.phone"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-link");
    expect(screen.getByRole("list")).toHaveClass("gc-ordered-list");
  });
  test("Error scrolls into view on click", async () => {
    const spy = jest.spyOn(document, "getElementById");
    const errors = getErrorList(props);
    render(errors);
    await fireEvent.click(screen.getByText("input-validation.required"));
    // scrollErrorInView is private, but will call document.getElementByID
    // twice to get the label and input to scroll to
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
  test("Error message gets focus", () => {
    // mok error element
    const errorElement = document.createElement("div");
    errorElement.className = "gc-form-errors";
    document.body.appendChild(errorElement);
    errorElement.focus = jest.fn();
    const spy = jest.spyOn(document, "getElementById").mockImplementation(() => {
      return errorElement;
    });

    setFocusOnErrorMessage(props, "gc-form-errors");
    expect(errorElement.focus).toHaveBeenCalled();
    spy.mockRestore();
  });
});
