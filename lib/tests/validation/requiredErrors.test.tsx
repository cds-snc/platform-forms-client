/**
 * @vitest-environment jsdom
 */
import React from "react";
import { createInstance } from "i18next";
import { render, screen, cleanup } from "@testing-library/react";
import { FormElement, FormElementTypes } from "@gcforms/types";
import { formatRequiredErrors } from "@lib/validation/requiredErrors";
import { ErrorListMessage } from "@clientComponents/forms/ErrorListItem/ErrorListMessage";
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
afterEach(cleanup);

describe.each(["en", "fr"] as const)("required errors (%s)", (language) => {
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
      const required = t(
        type === FormElementTypes.attestation
          ? "input-validation.all-checkboxes-required"
          : "input-validation.required"
      );
      const errors = { 1: required, 2: [{ 0: required }, { 0: required }] };
      const formatted = formatRequiredErrors(errors, [element, parent], language, t);
      const expected = t(`input-validation.error-list.${key}`, {
        question: language === "en" ? "Question" : "Question FR",
      });
      expect(formatted).toEqual({ 1: expected, 2: [{ 0: expected }, { 0: expected }] });
      expect(errors[1]).toBe(required);

      render(
        <>
          <div>
            <ErrorListMessage
              id={1}
              elements={[element]}
              language={language}
              defaultValue={String(formatted[1])}
            />
          </div>
          <div>
            <ErrorListMessage
              id="2.0.0"
              elements={[]}
              subElement={element}
              language={language}
              defaultValue={expected}
            />
          </div>
        </>
      );
      expect(screen.getAllByText(expected)).toHaveLength(2);
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
    expect(formatRequiredErrors({ 1: invalid }, [element], language, t)).toEqual({ 1: invalid });
    const formatted = formatRequiredErrors(
      {
        1: {
          fields: {
            streetAddress: null,
            city: t("input-validation.required"),
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
  });
});
