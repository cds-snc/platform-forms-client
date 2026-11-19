/**
 * @vitest-environment jsdom
 */
import { createInstance } from "i18next";
import { FormElement, FormElementTypes } from "@gcforms/types";
import type { ValidationError } from "@gcforms/core";
import { formatErrors } from "@lib/validation/formatErrors";
import en from "../../../i18n/translations/en/common.json";
import fr from "../../../i18n/translations/fr/common.json";

const i18n = createInstance();
vi.mock("@i18n/client", () => ({
  useTranslation: () => ({ t: i18n.t.bind(i18n) }),
}));

beforeAll(async () => {
  await i18n.init({
    resources: { en: { common: en }, fr: { common: fr } },
    defaultNS: "common",
    lng: "en",
  });
});

describe.each(["en", "fr"] as const)("required errors (%s)", (language) => {
  test.each([
    ["regex", "pattern-mismatch"],
    ["email", "invalid-email"],
    ["phone", "invalid-phone"],
    ["date-invalid", "invalid-date"],
    ["file-type-invalid", "invalid-file-type"],
  ] as const)(
    "formats %s identically for inline and summary without entry numbers",
    async (errorKey, code) => {
      await i18n.changeLanguage(language);
      const element: FormElement = {
        id: 1,
        type: FormElementTypes.textField,
        properties: { titleEn: "Question", titleFr: "Question FR" },
      };
      const parent: FormElement = {
        id: 2,
        type: FormElementTypes.dynamicRow,
        properties: { titleEn: "People", titleFr: "Personnes", subElements: [element] },
      };
      const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
      const message = t(`input-validation.${errorKey}`);
      const expected = `${message.replace(/\.$/, "")}: ${language === "en" ? "Question" : "Question FR"}`;
      const formatted = formatErrors(
        { 1: { code }, 2: [{ 0: { code } }] },
        [element, parent],
        language,
        t
      );
      expect(formatted).toEqual({ 1: expected, 2: [{ 0: expected }] });
    }
  );
  test.each([
    [FormElementTypes.textField, "default"],
    [FormElementTypes.textArea, "default"],
    [FormElementTypes.numberInput, "default"],
    [FormElementTypes.radio, "default"],
    [FormElementTypes.starRating, "default"],
    [FormElementTypes.combobox, "default"],
    [FormElementTypes.checkbox, "checkbox"],
    [FormElementTypes.dropdown, "select"],
    [FormElementTypes.fileInput, "file-input"],
    [FormElementTypes.formattedDate, "date-invalid"],
    [FormElementTypes.attestation, "check-all"],
  ] as const)(
    "%s uses the same question-specific wording inline and in the summary",
    async (type, key) => {
      await i18n.changeLanguage(language);
      const element: FormElement = {
        id: 1,
        type: type === FormElementTypes.attestation ? FormElementTypes.checkbox : type,
        properties: {
          titleEn: "Question",
          titleFr: "Question FR",
          validation: { required: true, all: type === FormElementTypes.attestation },
        },
      };
      const parent: FormElement = {
        id: 2,
        type: FormElementTypes.dynamicRow,
        properties: { titleEn: "People", titleFr: "Personnes", subElements: [element] },
      };
      const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
      const required: ValidationError = {
        code: type === FormElementTypes.attestation ? "all-checkboxes-required" : "required",
      };
      const errors = { 1: required, 2: [{ 0: required }, { 0: required }] };
      const formatted = formatErrors(errors, [element, parent], language, t);
      const expected = t(`input-validation.error-list.${key}`, {
        question: language === "en" ? "Question" : "Question FR",
      });
      const repeatedExpected = (count: number) =>
        t(`input-validation.error-list.${key}`, {
          question: t("input-validation.error-list.entry-question", {
            count,
            question: language === "en" ? "Question" : "Question FR",
          }),
        });
      expect(formatted).toEqual({
        1: expected,
        2: [{ 0: repeatedExpected(1) }, { 0: repeatedExpected(2) }],
      });
      expect(formatErrors({ 2: [{ 0: required }] }, [parent], language, t)).toEqual({
        2: [{ 0: repeatedExpected(1) }],
      });
      expect(errors[1]).toBe(required);
    }
  );

  test("preserves invalid-input errors and formats address subfield errors", async () => {
    await i18n.changeLanguage(language);
    const element: FormElement = {
      id: 1,
      type: FormElementTypes.addressComplete,
      properties: { titleEn: "Address", titleFr: "Adresse" },
    };
    const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
    const invalid = t("input-validation.email");
    expect(formatErrors({ 1: { code: "invalid-email" } }, [element], language, t)).toEqual({
      1: `${invalid.replace(/\.$/, "")}: ${language === "en" ? "Address" : "Adresse"}`,
    });
    const formatted = formatErrors(
      {
        1: {
          fields: {
            streetAddress: null,
            city: { code: "required" },
            province: null,
            postalCode: null,
          },
        },
      },
      [element],
      language,
      t
    );
    expect(formatted).toEqual({
      1: {
        fields: {
          streetAddress: null,
          city: t("input-validation.error-list.default", {
            question: language === "en" ? "City or town" : "Ville ou communauté",
          }),
          province: null,
          postalCode: null,
        },
      },
    });

    const parent: FormElement = {
      id: 2,
      type: FormElementTypes.dynamicRow,
      properties: { titleEn: "Rows", titleFr: "Lignes", subElements: [element] },
    };
    const addressError = {
      fields: {
        streetAddress: null,
        city: { code: "required" } as const,
        province: null,
        postalCode: null,
      },
    };
    expect(formatErrors({ 2: [{}, { 0: addressError }, {}] }, [parent], language, t)).toEqual({
      2: [
        {},
        {
          0: {
            fields: {
              streetAddress: null,
              city: t("input-validation.error-list.default", {
                question: t("input-validation.error-list.entry-question", {
                  count: 2,
                  question: language === "en" ? "City or town" : "Ville ou communauté",
                }),
              }),
              province: null,
              postalCode: null,
            },
          },
        },
        {},
      ],
    });
    expect(addressError.fields.city).toEqual({ code: "required" });
  });

  test("rejects repeating-set errors attached to a text field instead of returning raw objects", () => {
    const element: FormElement = {
      id: 1,
      type: FormElementTypes.textField,
      properties: { titleEn: "Question", titleFr: "Question FR" },
    };
    const t = vi.fn(() => "");

    expect(() =>
      formatErrors({ 1: [{ 0: { code: "required" } }] }, [element], language, t)
    ).toThrowError("Unexpected validation error structure for element 1 (textField)");
    expect(t).not.toHaveBeenCalled();
  });

  test.each<[ValidationError, string, Record<string, unknown>?]>([
    [{ code: "invalid-alphanumeric" }, "input-validation.alphanumeric"],
    [{ code: "invalid-number" }, "input-validation.number"],
    [{ code: "invalid-date-format" }, "input-validation.date"],
    [{ code: "unsafe-regex" }, "input-validation.invalidRegex"],
    [{ code: "mismatched-type" }, "input-validation.mismatched-type"],
    [{ code: "min-digits" }, "input-validation.too-few-digits"],
    [{ code: "max-digits" }, "input-validation.too-many-digits"],
    [{ code: "min-value", min: -2.5 }, "input-validation.too-small", { min: "-2.5" }],
    [{ code: "max-value", max: 0 }, "input-validation.too-large", { max: "0" }],
    [{ code: "file-too-large", maxSizeInMb: 10 }, "input-validation.file-size-too-large"],
  ])("translates %j at the boundary using the requested language", async (error, key, options) => {
    await i18n.changeLanguage(language === "en" ? "fr" : "en");
    const element: FormElement = {
      id: 1,
      type: FormElementTypes.textField,
      properties: { titleEn: "Question", titleFr: "Question FR" },
    };
    const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
    const message = t(key, { ...options, lng: language });
    expect(formatErrors({ 1: error }, [element], language, t)).toEqual({
      1: `${message.replace(/\.$/, "")}: ${language === "en" ? "Question" : "Question FR"}`,
    });
  });
});
