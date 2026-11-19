import { FormElement, FormElementTypes, PublicFormRecord, Responses } from "@gcforms/types";
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

    it.each(["{", "null", "[]", "123", '{"city":null}', '{"city":{"toString":null}}'])(
      "flags malformed address %s, including optional and unconfigured fields",
      (value) => {
        for (const validation of [{ required: true }, { required: false }, undefined]) {
          const address: FormElement = {
            ...text,
            type: FormElementTypes.addressComplete,
            properties: { ...text.properties, validation },
          };
          const result = validateVisibleElements(
            { 21: value },
            { formRecord: formRecord(address) }
          );
          expect(result.errors).toEqual({ 21: { code: "mismatched-type" } });
          expect(result.hasMalformedPayload).toBe(true);
          expect(result.valueMatchErrors[21]).toMatchObject({
            elementId: 21,
            type: FormElementTypes.addressComplete,
            value,
          });
        }
      }
    );

    it.each(["{}", '{"streetAddress":"","city":"Ottawa","province":"  ","country":"Canada"}'])(
      "keeps incomplete address %s as required subfield errors only",
      (value) => {
        const address: FormElement = { ...text, type: FormElementTypes.addressComplete };
        const result = validateVisibleElements({ 21: value }, { formRecord: formRecord(address) });
        expect(result.errors[21]).toMatchObject({
          fields: {
            streetAddress: { code: "required" },
            province: { code: "required" },
            postalCode: { code: "required" },
          },
        });
        expect(result.hasMalformedPayload).toBe(false);
        expect(result.valueMatchErrors).toEqual({});

        address.properties = { ...address.properties, validation: { required: false } };
        const optional = validateVisibleElements(
          { 21: value },
          { formRecord: formRecord(address) }
        );
        expect(optional.errors).toEqual({});
        expect(optional.hasMalformedPayload).toBe(false);
      }
    );

    it("accepts valid address JSON", () => {
      const address: FormElement = { ...text, type: FormElementTypes.addressComplete };
      const result = validateVisibleElements(
        {
          21: '{"streetAddress":"123 Main St","city":"Ottawa","province":"ON","postalCode":"K1A0B1","country":"Canada"}',
        },
        { formRecord: formRecord(address) }
      );
      expect(result.errors).toEqual({});
      expect(result.hasMalformedPayload).toBe(false);
    });

    it("detects malformed optional nested addresses through the existing traversal", () => {
      const element: FormElement = {
        ...repeating,
        properties: {
          ...repeating.properties,
          validation: undefined,
          subElements: [
            {
              ...text,
              type: FormElementTypes.addressComplete,
              properties: { ...text.properties, validation: { required: false } },
            },
          ],
        },
      };
      const result = validateVisibleElements(
        { 20: [{ 0: '{"postalCode":123}' }] },
        { formRecord: formRecord(element) }
      );
      expect(result.hasMalformedPayload).toBe(true);
      expect(result.errors).toEqual({ 20: { code: "mismatched-type" } });
    });

    it.each(["{", "null", "[]", "123", '{"YYYY":2026,"MM":2,"DD":30}'])(
      "reports malformed date %s without throwing in either validation pass",
      (value) => {
        const date: FormElement = { ...text, type: FormElementTypes.formattedDate };
        const result = validateVisibleElements({ 21: value }, { formRecord: formRecord(date) });
        expect(result.errors).toEqual({ 21: { code: "invalid-date" } });
        expect(result.valueMatchErrors[21]).toMatchObject({ elementId: 21, value });
        expect(result.hasMalformedPayload).toBe(value !== '{"YYYY":2026,"MM":2,"DD":30}');

        const withoutRules = { ...date, properties: { ...date.properties, validation: undefined } };
        const withoutRulesResult = validateVisibleElements(
          { 21: value },
          { formRecord: formRecord(withoutRules) }
        );
        expect(withoutRulesResult.errors).toEqual({ 21: { code: "mismatched-type" } });
        expect(withoutRulesResult.hasMalformedPayload).toBe(result.hasMalformedPayload);
      }
    );

    it.each(["{}", '{"MM":2}', '{"YYYY":null,"MM":2,"DD":3}'])(
      "treats incomplete date objects as ordinary invalid answers (%s)",
      (value) => {
        const date: FormElement = { ...text, type: FormElementTypes.formattedDate };
        const result = validateVisibleElements({ 21: value }, { formRecord: formRecord(date) });
        expect(result.errors).toEqual({ 21: { code: "invalid-date" } });
        expect(result.hasMalformedPayload).toBe(false);
      }
    );

    it.each([undefined, null, ""])(
      "does not mark optional empty inputs malformed (%s)",
      (value) => {
        for (const type of [
          FormElementTypes.formattedDate,
          FormElementTypes.dynamicRow,
          FormElementTypes.addressComplete,
        ]) {
          const element = {
            ...text,
            type,
            properties: { ...text.properties, validation: { required: false } },
          };
          const result = validateVisibleElements({ 21: value } as Responses, {
            formRecord: formRecord(element),
          });
          expect(result.hasMalformedPayload).toBe(false);
        }
      }
    );

    it("accepts valid date JSON and preserves missing required dates", () => {
      const date: FormElement = { ...text, type: FormElementTypes.formattedDate };
      expect(
        validateVisibleElements(
          { 21: '{"YYYY":2024,"MM":2,"DD":29}' },
          { formRecord: formRecord(date) }
        ).errors
      ).toEqual({});
      expect(validateVisibleElements({}, { formRecord: formRecord(date) }).errors).toEqual({
        21: { code: "required" },
      });
    });

    it.each([undefined, null, ""])("accepts an absent optional file (%s)", (value) => {
      expect(
        validateVisibleElements({ 22: value } as Responses, { formRecord: formRecord(file) }).errors
      ).toEqual({});
      const requiredFile = {
        ...file,
        properties: { ...file.properties, validation: { required: true } },
      };
      expect(
        validateVisibleElements({ 22: value } as Responses, {
          formRecord: formRecord(requiredFile),
        }).errors
      ).toEqual({ 22: { code: "required" } });
    });

    it("reports non-string file names in both rules and server file diagnostics", () => {
      const value = { name: 123, size: 10, id: "invalid" };
      const result = validateVisibleElements({ 22: value } as unknown as Responses, {
        formRecord: formRecord(file),
      });
      expect(result.errors).toEqual({ 22: { code: "mismatched-type" } });
      expect(result.valueMatchErrors[22]).toMatchObject({
        elementId: 22,
        type: FormElementTypes.fileInput,
        value,
      });
    });

    it.each([FormElementTypes.textField, FormElementTypes.textArea])(
      "handles null %s values with configured length validation",
      (type) => {
        const element = {
          ...text,
          type,
          properties: { ...text.properties, validation: { required: false, maxLength: 2 } },
        };
        expect(
          validateVisibleElements({ 21: null } as unknown as Responses, {
            formRecord: formRecord(element),
          }).errors
        ).toEqual({});
        element.properties.validation.required = true;
        expect(
          validateVisibleElements({ 21: null } as unknown as Responses, {
            formRecord: formRecord(element),
          }).errors
        ).toEqual({ 21: { code: "required" } });
      }
    );

    it.each([undefined, null, ""])("blocks absent repeating rows (%s)", (value) => {
      expect(
        validateVisibleElements({ 20: value } as Responses, {
          formRecord: formRecord(repeating),
        }).errors
      ).toEqual({ 20: { code: "mismatched-type" } });
    });

    it.each(["not rows", {}, [null], [123], [[]]])(
      "rejects malformed repeating rows (%j) without throwing",
      (value) => {
        const result = validateVisibleElements({ 20: value } as Responses, {
          formRecord: formRecord(repeating),
        });
        expect(result.errors).toEqual({ 20: { code: "mismatched-type" } });
        expect(result.valueMatchErrors[20]).toMatchObject({ elementId: 20, value });
        expect(result.hasMalformedPayload).toBe(true);
      }
    );

    it("preserves row rule errors ahead of malformed-row mismatches", () => {
      const result = validateVisibleElements({ 20: [{ 0: "" }, null] } as Responses, {
        formRecord: formRecord(repeating),
      });
      expect(result.errors).toEqual({ 20: [{ 0: { code: "required" } }, {}] });
      expect(result.valueMatchErrors[20]).toMatchObject({ elementId: 20 });
      expect(result.hasMalformedPayload).toBe(true);
    });

    it("detects malformed nested dates without configured validation rules", () => {
      const element = {
        ...repeating,
        properties: {
          ...repeating.properties,
          validation: undefined,
          subElements: [{ ...text, type: FormElementTypes.formattedDate }],
        },
      };
      expect(
        validateVisibleElements({ 20: [{ 0: "{" }] }, { formRecord: formRecord(element) })
          .hasMalformedPayload
      ).toBe(true);
    });

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
        20: [{ 0: { code: "required" } }, { 0: { code: "mismatched-type" } }],
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

    it("preserves row indexes when input type guards report a mismatch", () => {
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
      const rows: ValidationErrors[] = [{}, { 0: { code: "mismatched-type" } }, {}];
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
