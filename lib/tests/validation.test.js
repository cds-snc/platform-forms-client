import { validateOnSubmit, getErrorList, setFocusOnErrorMessage } from "../validation";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { isValidGovEmail } from "@lib/validation";
import emailDomains from "../../email.domains.json";

function getFormMetaData(type, textType, required = false, formElement = null) {
  return {
    formRecord: {
      formConfig: {
        form: {
          elements: [
            {
              id: 1,
              type: type,
              properties: {
                ...formElement?.properties,
                validation: {
                  type: textType,
                  required: required,
                  ...formElement?.properties?.validation,
                },
              },
            },
          ],
        },
      },
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
    passConditions: [{ 1: "test value" }],
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
    failConditions: [{ 1: "25/05/1950" }, { 1: "notADate" }],
    expectedError: { 1: "input-validation.date" },
  },
  {
    fieldType: "textField",
    subType: "phone",
    passConditions: [{ 1: "1-819-555-7777" }, { 1: "1234567890" }],
    failConditions: [{ 1: "888-8989" }, { 1: "notAPhoneNumber" }, { 1: "123456789" }],
    expectedError: { 1: "input-validation.phone" },
  },
  // required validation for other components
  {
    fieldType: "textArea",
    passConditions: [{ 1: "text area value" }],
    failConditions: [{ 1: "" }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "textArea",
    passConditions: [{ 1: "less than max" }],
    failConditions: [{ 1: "more characters than the max length" }],
    expectedError: { 1: "input-validation.too-many-characters" },
    required: true,
    formElement: {
      properties: {
        validation: {
          maxLength: 15,
        },
      },
    },
  },
  {
    fieldType: "dropdown",
    passConditions: [{ 1: "myChoice" }],
    failConditions: [{ 1: undefined }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "radio",
    passConditions: [{ 1: ["myChoice"] }],
    failConditions: [{ 1: undefined }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "checkbox",
    passConditions: [{ 1: ["myChoice1", "myChoice2"] }],
    failConditions: [{ 1: undefined }, { 1: [] }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "checkbox",
    passConditions: [{ 1: ["myChoice", "myChoice2"] }],
    failConditions: [{ 1: ["myChoice1"] }],
    expectedError: { 1: "input-validation.all-checkboxes-required" },
    required: true,
    formElement: {
      properties: {
        choices: [
          {
            en: "myChoice1",
            fr: "myChoice1",
          },
          {
            en: "myChoice2",
            fr: "myChoice2",
          },
        ],
        validation: {
          required: true,
          all: true,
        },
      },
    },
  },
  {
    fieldType: "fileInput",
    passConditions: [
      {
        file: new File([""], "fileName", { type: "application/pdf" }),
        src: null,
        name: "",
        size: 0,
        type: "application/pdf",
      },
    ],
    failConditions: [{ 1: { file: null, src: null, name: "", size: 0, type: null } }],
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
    ({
      fieldType,
      subType,
      passConditions,
      failConditions,
      expectedError,
      required,
      formElement,
    }) => {
      const props = getFormMetaData(
        fieldType,
        subType ? subType : undefined,
        required ? required : false,
        formElement
      );
      passConditions.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(Object.keys(errors)).toHaveLength(0);
      });
      failConditions.map((value) => {
        const errors = validateOnSubmit(value, props);
        expect(errors).toMatchObject(expectedError);
      });
    }
  );

  describe("DynamicRow element tests", () => {
    const formRecord = {
      formConfig: {
        form: {
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
                      validation: {
                        type: "text",
                        required: false,
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
        },
      },
    };
    test("validates required dynamicRow fields row correctly", () => {
      const errors = validateOnSubmit(
        {
          0: [
            { 1: "", 3: "" },
            { 1: "", 3: "" },
          ],
        },
        { formRecord, t: (key) => key }
      );
      expect(errors).toEqual({
        0: [
          {
            1: "input-validation.required",
            3: null,
          },
          {
            1: "input-validation.required",
            3: null,
          },
        ],
      });
    });
    test("validates dynamic row correctly", () => {
      const errors = validateOnSubmit(
        {
          0: [
            { 1: "test", 3: "" },
            { 1: "test", 3: "" },
          ],
        },
        { formRecord, t: (key) => key }
      );
      expect(errors).toEqual({});
    });
  });
  test("Value not in elements", () => {
    const props = getFormMetaData("textField", "");
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
    formRecord: { formConfig: { form: { layout: [1, 2] } } },
  };
  test("Error list renders", () => {
    const errors = getErrorList(props);
    render(errors);
    const inputValidationReq = screen.getByText("input-validation.required");
    expect(inputValidationReq).toBeInTheDocument();
    expect(inputValidationReq).toHaveClass("gc-error-link");
    const inputValidationPhone = screen.getByText("input-validation.phone");
    expect(inputValidationPhone).toBeInTheDocument();
    expect(inputValidationPhone).toHaveClass("gc-error-link");
    expect(screen.getByRole("list")).toHaveClass("gc-ordered-list");
  });
  test("Error scrolls into view on click", async () => {
    userEvent.setup();
    const spy = jest.spyOn(document, "getElementById");
    const errors = getErrorList(props);
    render(errors);
    await userEvent.click(screen.getByText("input-validation.required"));
    // scrollErrorInView is private, but will call document.getElementByID
    // twice to get the label and input to scroll to
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
  test("Error message gets focus", () => {
    // mock error element
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

describe("Test getErrorList function when error order doesn't match display order", () => {
  afterEach(cleanup);
  const props = {
    touched: true,
    errors: {
      1: "input-validation.required",
      2: "input-validation.phone",
    },
    formRecord: { formConfig: { form: { layout: [2, 1] } } },
  };
  it("Renders error list in order matching display order", () => {
    const errors = getErrorList(props);
    const { container } = render(errors);
    const { childNodes } = container.firstChild;
    const firstDisplayedError = childNodes[0].childNodes[0];
    const secondDisplayedError = childNodes[1].childNodes[0];
    expect(screen.getByText("input-validation.phone")).toStrictEqual(firstDisplayedError);
    expect(screen.getByText("input-validation.required")).toStrictEqual(secondDisplayedError);
  });
});

describe("Gov Email domain validator", () => {
  it("Should return false with an empty string passed as email", async () => {
    expect(isValidGovEmail("", "{}")).toBeFalsy();
  });

  it("Should return false with an undefined domain list", async () => {
    expect(isValidGovEmail("test@gc.ca", undefined)).toBeFalsy();
  });

  it("Should return false with an wrong email format", async () => {
    expect(isValidGovEmail("wrongEmailformat.gc.ca", "")).toBeFalsy();
  });

  it("Should return false with an empty domain list", async () => {
    expect(isValidGovEmail("testt@gc.ca", '{"domains": []}')).toBeFalsy();
  });

  it("Should return true by validating an valid email against GC's domains", async () => {
    expect(isValidGovEmail("test@canada.ca", emailDomains.domains)).toBeTruthy();
  });

  it("Should return true : the given email is a valid Gov email", async () => {
    expect(isValidGovEmail("test@canada.ca", ["gc.ca", "canada.ca", "cds-snc.ca"])).toBeTruthy();
  });
});
