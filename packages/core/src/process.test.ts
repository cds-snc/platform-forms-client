import { FormElement, FormElementTypes, PublicFormRecord } from "@gcforms/types";
import contactFormRecord from "../__fixtures__/contactformRecord.json";

import { validate, validateVisibleElements } from "./process";
import type { ValidationErrors } from "./validation/validationErrorTypes";

// https://forms-staging.cdssandbox.xyz/en/id/cmeaj61dl0001xf01aja6mnpf

describe("Form validation - start page", () => {
  it("should validate start page when empty", () => {
    const values = { 2: "", 10: "" };

    const currentGroup = "start";

    const errors = validate({
      values: values,
      currentGroup,
      formRecord: contactFormRecord as PublicFormRecord,
    });

    expect(errors).toStrictEqual({
      "11": { code: "required" }, // Preferred language
      "2": { code: "required" }, // Your name
    });
  });

  it("should validate start page some fields are filled in", () => {
    const values = { 2: "", 10: "", 11: "English" };
    const currentGroup = "start";

    const errors = validate({
      values: values,
      currentGroup,
      formRecord: contactFormRecord as PublicFormRecord,
    });

    expect(errors).toStrictEqual({
      "2": { code: "required" }, // Your name
    });
  });

  it("should show start group elements", () => {
    const values = {
      "2": "Tim",
      currentGroup: "start",
    };

    const { visibility } = validateVisibleElements(values, {
      formRecord: contactFormRecord as PublicFormRecord,
    });

    // For start page all fields are visible
    const result = new Map<string, boolean>();
    result.set("2", true); // Your name
    result.set("8", true); // How can we contact you
    result.set("9", true); // Phone #
    result.set("10", true); // Emnail
    result.set("11", true); // Preferred language

    expect(visibility).toStrictEqual(result);
  });
});

describe("Form validation - details page", () => {
  it("should show other text field when 'Other' is selected", () => {
    const values = {
      "2": "Tim",
      "9": "111-222-3333",
      "10": "Tim@example.com",
      "11": "English",
      "12": "Other",
      "13": "Other text field",
      currentGroup: "b0e74a96-fa9e-43f4-8573-4b4ba23d65e5",
    };

    const { visibility } = validateVisibleElements(values, {
      formRecord: contactFormRecord as PublicFormRecord,
    });

    // For details page 'Other' is selected so the 'Other' text field is visible
    const result = new Map<string, boolean>();
    result.set("12", true);
    result.set("13", true);

    expect(visibility).toStrictEqual(result);
  });

  describe("structured validation errors", () => {
    const text: FormElement = {
      id: 21,
      type: FormElementTypes.textField,
      properties: { titleEn: "Text", titleFr: "Texte", validation: { required: true } },
    };
    const file: FormElement = {
      id: 22,
      type: FormElementTypes.fileInput,
      properties: { titleEn: "File", titleFr: "Fichier", validation: { required: false } },
    };
    const repeating: FormElement = {
      id: 20,
      type: FormElementTypes.dynamicRow,
      properties: {
        titleEn: "Rows",
        titleFr: "Lignes",
        validation: { required: false },
        subElements: [text, file],
      },
    };
    const formRecord = (element: FormElement) =>
      ({
        ...contactFormRecord,
        form: { ...contactFormRecord.form, elements: [element], groups: undefined },
      }) as PublicFormRecord;
    const validFile = { name: "test.pdf", size: 10, id: "valid" };
    const invalidFile = { name: "test.exe", size: 10, id: "invalid" };

    it("preserves empty row maps and subelement indexes for rule errors", () => {
      const { errors } = validateVisibleElements(
        {
          20: [
            { 0: "valid", 1: validFile },
            { 0: "", 1: validFile },
            { 0: "valid", 1: validFile },
          ],
        },
        { formRecord: formRecord(repeating) }
      );
      expect(errors).toStrictEqual({ 20: [{}, { 0: { code: "required" } }, {}] });
    });

    it("retains rule errors ahead of mismatches while reporting separate diagnostics", () => {
      const { errors, valueMatchErrors } = validateVisibleElements(
        { 22: invalidFile },
        { formRecord: formRecord(file) }
      );
      expect(errors).toStrictEqual({ 22: { code: "invalid-file-type" } });
      expect(valueMatchErrors).toStrictEqual({
        22: { elementId: 22, type: FormElementTypes.fileInput, value: invalidFile },
      });

      const repeated = validateVisibleElements(
        {
          20: [
            { 0: "", 1: validFile },
            { 0: "valid", 1: invalidFile },
          ],
        },
        { formRecord: formRecord(repeating) }
      );
      expect(repeated.errors).toStrictEqual({
        20: [{ 0: { code: "required" } }, { 1: { code: "invalid-file-type" } }],
      });
      expect(repeated.valueMatchErrors).toStrictEqual({
        20: [
          {
            rowIndex: 1,
            responseKey: 1,
            subElementId: 22,
            type: FormElementTypes.fileInput,
            value: invalidFile,
          },
        ],
      });

      const separateRowMismatch = validateVisibleElements(
        {
          20: [
            { 0: "", 1: validFile },
            { 0: 123, 1: validFile },
          ],
        },
        { formRecord: formRecord(repeating) }
      );
      expect(separateRowMismatch.errors).toStrictEqual({
        20: [{ 0: { code: "required" } }, {}],
      });
      expect(separateRowMismatch.valueMatchErrors).toStrictEqual({
        20: [
          {
            rowIndex: 1,
            responseKey: 0,
            subElementId: 21,
            type: FormElementTypes.textField,
            value: 123,
          },
        ],
      });
    });

    it("preserves sparse mismatch row indexes when no rule error exists", () => {
      const { errors, valueMatchErrors } = validateVisibleElements(
        {
          20: [
            { 0: "valid", 1: validFile },
            { 0: 123, 1: validFile },
            { 0: "valid", 1: validFile },
          ],
        },
        { formRecord: formRecord(repeating) }
      );
      const rows: ValidationErrors[] = [];
      rows[1] = { 0: { code: "mismatched-type" } };
      expect(errors).toStrictEqual({ 20: rows });
      expect(valueMatchErrors).toStrictEqual({
        20: [
          {
            rowIndex: 1,
            responseKey: 0,
            subElementId: 21,
            type: FormElementTypes.textField,
            value: 123,
          },
        ],
      });
    });
  });

  it("should hide other text field when 'API' is selected", () => {
    const values = {
      "2": "Tim",
      "9": "111-222-3333",
      "10": "Tim@example.com",
      "11": "English",
      "12": "Request technical support with the API",
      "13": "Other text field",
      "14": "More info",
      currentGroup: "b0e74a96-fa9e-43f4-8573-4b4ba23d65e5",
    };

    const { visibility } = validateVisibleElements(values, {
      formRecord: contactFormRecord as PublicFormRecord,
    });

    // For details page 'Other'  is selected so the 'Other' text field is visible
    const result = new Map<string, boolean>();
    result.set("12", true);

    expect(visibility).toStrictEqual(result);
  });

  it("should validate details page when empty", () => {
    const values = {};
    const currentGroup = "b0e74a96-fa9e-43f4-8573-4b4ba23d65e5";

    const errors = validate({
      values: values,
      currentGroup,
      formRecord: contactFormRecord as PublicFormRecord,
    });

    expect(errors).toStrictEqual({
      "12": { code: "required" }, // Reason for reaching out
    });
  });
});
