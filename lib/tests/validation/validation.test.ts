/**
 * @vitest-environment jsdom
 */
import { vi } from "vitest";

vi.mock("@i18n/client", () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en", changeLanguage: async () => undefined },
  }),
}));

vi.mock("@clientComponents/forms/ErrorListItem/ErrorListMessage", () => ({
  __esModule: true,
  ErrorListMessage: ({ defaultValue }: { defaultValue: string }) => defaultValue,
}));

import {
  setFocusOnErrorMessage,
  isValidGovEmail,
  containsSymbol,
  containsLowerCaseCharacter,
  containsUpperCaseCharacter,
  containsNumber,
} from "@lib/validation/validation";

import { validateOnSubmit } from "../../../packages/core/src";
import { cleanup } from "@testing-library/react";

type ValidationValues = Parameters<typeof validateOnSubmit>[0];
type ValidationProps = Parameters<typeof validateOnSubmit>[1];

type FormElementOverride = {
  properties?: {
    validation?: Record<string, unknown>;
    choices?: Array<{ en: string; fr: string }>;
  } & Record<string, unknown>;
};

type TestCase = {
  fieldType: string;
  subType?: string;
  passConditions: Array<Record<number, unknown>>;
  failConditions: Array<Record<number, unknown>>;
  expectedError: Record<number, unknown>;
  required?: boolean;
  formElement?: FormElementOverride;
};

const toValidationValues = (value: Record<number, unknown>): ValidationValues => {
  return value as unknown as ValidationValues;
};

const toValidationProps = (value: unknown): ValidationProps => {
  return value as ValidationProps;
};

function getFormMetaData(
  type: string,
  textType: string | undefined,
  required = false,
  formElement: FormElementOverride | null = null
): ValidationProps {
  return {
    formRecord: {
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
    t: (key: string) => key,
  } as unknown as ValidationProps;
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
const testCases: TestCase[] = [
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
    fieldType: "numberInput",
    subType: "number",
    passConditions: [{ 1: "1" }, { 1: "4" }],
    failConditions: [{ 1: "two" }, { 1: "four" }, { 1: "-1" }],
    expectedError: { 1: "input-validation.number" },
  },
  {
    fieldType: "numberInput",
    subType: "number",
    passConditions: [{ 1: "-1" }, { 1: "-42" }],
    failConditions: [{ 1: "two" }],
    expectedError: { 1: "input-validation.number" },
    formElement: {
      properties: {
        allowNegativeNumbers: true,
      },
    },
  },
  {
    fieldType: "numberInput",
    subType: "number",
    passConditions: [{ 1: "5" }, { 1: "6" }],
    failConditions: [{ 1: "4" }],
    expectedError: { 1: "input-validation.too-small" },
    formElement: {
      properties: {
        validation: {
          minValue: 5,
        },
      },
    },
  },
  {
    fieldType: "numberInput",
    subType: "number",
    passConditions: [{ 1: "5" }, { 1: "4" }],
    failConditions: [{ 1: "6" }],
    expectedError: { 1: "input-validation.too-large" },
    formElement: {
      properties: {
        validation: {
          maxValue: 5,
        },
      },
    },
  },
  {
    fieldType: "numberInput",
    subType: "number",
    passConditions: [{ 1: "123" }, { 1: "1234" }],
    failConditions: [{ 1: "12" }],
    expectedError: { 1: "input-validation.too-few-digits" },
    formElement: {
      properties: {
        validation: {
          minDigits: 3,
        },
      },
    },
  },
  {
    fieldType: "numberInput",
    subType: "number",
    passConditions: [{ 1: "12" }, { 1: "123" }],
    failConditions: [{ 1: "1234" }],
    expectedError: { 1: "input-validation.too-many-digits" },
    formElement: {
      properties: {
        validation: {
          maxDigits: 3,
        },
      },
    },
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
    passConditions: [{ 1: "myChoice" }],
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
        1: {
          name: "fileName.csv",
          size: 4409479,
          content: Buffer.from("myFile"),
        },
      },
    ],
    failConditions: [{ 1: { name: null, size: null, content: null } }],
    expectedError: { 1: "input-validation.required" },
    required: true,
  },
  {
    fieldType: "fileInput",
    passConditions: [
      {
        1: {
          name: "fileName.csv",
          size: 1,
          content: Buffer.from("myFile"),
        },
      },
    ],
    failConditions: [
      {
        1: {
          name: "fileName.weird",
          size: 1,
          content: Buffer.from("myFile"),
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
      passConditions.map((value: Record<number, unknown>) => {
        const errors = validateOnSubmit(toValidationValues(value), props);
        expect(Object.keys(errors)).toHaveLength(0);
      });
      failConditions.map((value: Record<number, unknown>) => {
        const errors = validateOnSubmit(toValidationValues(value), props);
        expect(errors).toMatchObject(expectedError);
      });
    }
  );

  describe("DynamicRow element tests", () => {
    const formRecord = {
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
    };
    test("validates required dynamicRow fields row correctly", () => {
      const errors = validateOnSubmit(
        {
          0: [
            { 1: "", 3: "" },
            { 1: "", 3: "" },
          ],
        },
        toValidationProps({ formRecord, t: (key: string) => key })
      );
      expect(errors).toEqual({
        0: [
          {
            1: "input-validation.required",
          },
          {
            1: "input-validation.required",
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
        toValidationProps({ formRecord, t: (key: string) => key })
      );
      expect(errors).toEqual({});
    });
  });
  test("Value not in elements", () => {
    const props = getFormMetaData("textField", "");
    const values = { 4: "test value" };
    const errors = validateOnSubmit(toValidationValues(values), props);
    expect(errors).not.toHaveProperty("4");
  });
});

describe("Test getErrorList function", () => {
  afterEach(cleanup);

  test("Error message gets focus", () => {
    const props = {
      touched: true,
      errors: {
        1: "input-validation.required",
        2: "input-validation.phone",
      },
    } as unknown as Parameters<typeof setFocusOnErrorMessage>[0];

    const errorElement = document.createElement("div");
    errorElement.className = "gc-form-errors";
    document.body.appendChild(errorElement);
    const spyFocus = vi.spyOn(errorElement, "focus");
    const spy = vi.spyOn(document, "getElementById").mockImplementation(() => {
      return errorElement;
    });

    setFocusOnErrorMessage(props, "gc-form-errors");
    expect(spyFocus).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("Gov Email domain validator", () => {
  it.each([
    ["", false],
    ["wrongEmailformat.gc.ca", false],
    ["test@something", false],
    ["test@nfb.ca", true],
    ["test@nfb-onf.gc.ca", true],
    ["test@debates-debats.ca", true],
    ["test@tbs-sct.gc.ca", true],
    ["test@sub.gc.ca", true],
    ["test@sub.sub.sub.gc.ca", true],
    ["test@sub-sub-sub.gc.ca", true],
    ["test@canada.ca", true],
    ["test@sub.canada.ca", false],
    ["test@canada.com", false],
    ["test@cds-snc.ca", true],
    ["test@cds-snc.freshdesk.com", true],
    ["test@elections.ca", true],
    ["test@rcafinnovation.ca", true],
    ["test@canadacouncil.ca", true],
    ["test.hi@cds-snc.ca", true],
    ["test-hi@cds-snc.ca", true],
    ["test@something.ca", false],
    ["test+example@cds-snc.ca", true],
    ["test.hi+example-1@cds-snc.ca", true],
    ["test.with'apostrophe@cds-snc.ca", true],
    ["test@invcanada.ca", true],
    ["test.test@scc-ccn.ca", true],
    ["test.test@scc.ca", true],
  ])(`Should return true if email is valid (testing "%s")`, async (email, isValid) => {
    expect(isValidGovEmail(email)).toBe(isValid);
  });
});

describe("Tests Password Validation", () => {
  it.each([
    ["", false],
    ["ASDF", false],
    ["asdf", true],
    ["@@##", false],
    ["1234", false],
    ["ASDF1234", false],
    ["asdf1234", true],
    ["asdf1234!@#$", true],
    ["asdf1234!@#$ASDF", true],
    ["1234!@#$ASDF", false],
  ])(
    `Should return true if password contains lowercase (testing "%s")`,
    async (password, isValid) => {
      expect(containsLowerCaseCharacter(password)).toBe(isValid);
    }
  );
  it.each([
    ["", false],
    ["ASDF", true],
    ["asdf", false],
    ["@@##", false],
    ["1234", false],
    ["ASDF1234", true],
    ["asdf1234", false],
    ["asdf1234!@#$", false],
    ["asdf1234!@#$ASDF", true],
    ["1234!@#$asdf", false],
  ])(
    `Should return true if password contains uppercase (testing "%s")`,
    async (password, isValid) => {
      expect(containsUpperCaseCharacter(password)).toBe(isValid);
    }
  );
  it.each([
    ["", false],
    ["ASDF", false],
    ["asdf", false],
    ["@@##", false],
    ["1234", true],
    ["ASDF1234", true],
    ["asdf1234", true],
    ["asdf!@#$", false],
    ["asdf1234!@#$ASDF", true],
    ["ASDF!@#$asdf", false],
  ])(
    `Should return true if password contains a number (testing "%s")`,
    async (password, isValid) => {
      expect(containsNumber(password)).toBe(isValid);
    }
  );
  it.each([
    ["", false],
    ["a", false],
    ["^", true],
    ["$", true],
    ["*", true],
    [".", true],
    ["[", true],
    ["]", true],
    ["{", true],
    ["}", true],
    ["(", true],
    [")", true],
    ["?", true],
    ['"', true],
    ["!", true],
    ["@", true],
    ["#", true],
    ["%", true],
    ["&", true],
    ["/", true],
    ["\\", true],
    [",", true],
    [">", true],
    ["<", true],
    ["'", true],
    [":", true],
    [";", true],
    ["|", true],
    ["_", true],
    ["~", true],
    ["`", true],
    ["=", true],
    ["+", true],
    ["-", true],
    ["^^", true],
    ["^$(", true],
    ["⌘", false],
    ["༄", false],
    ["⌔", false],
  ])(
    `Should properly validate or not the use of symbols in password (symbol under test "%s")`,
    async (symbol, isValid) => {
      const password = "thisIsMyPassword" + symbol;
      expect(containsSymbol(password)).toBe(isValid);
    }
  );
});
