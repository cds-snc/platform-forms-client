/**
 * @vitest-environment jsdom
 */
import React from "react";
import { createInstance } from "i18next";
import { render, screen, cleanup } from "@testing-library/react";
import { FormElement, FormElementTypes } from "@gcforms/types";
import { isFieldResponseValid } from "../../../packages/core/src/validation/validation";
import { ErrorListMessage } from "@clientComponents/forms/ErrorListItem/ErrorListMessage";
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

afterEach(cleanup);

describe.each(["en", "fr"] as const)("character-limit errors (%s)", (language) => {
  test.each([FormElementTypes.textField, FormElementTypes.textArea])(
    "%s preserves the count-aware error in top-level and repeated summaries",
    async (type) => {
      await i18n.changeLanguage(language);
      const element: FormElement = {
        id: 1,
        type,
        properties: {
          titleEn: "Name",
          titleFr: "Nom",
          validation: { required: false, maxLength: 2 },
        },
      };
      const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);

      expect(isFieldResponseValid("ab", element, t)).toBeNull();
      for (const value of ["abc", "abcd"]) {
        const error = isFieldResponseValid(value, element, t);
        const expected = i18n.t("formElements.characterCount.exceeded", {
          count: value.length - 2,
        });
        expect(error).toBe(expected);
        expect(typeof error).toBe("string");
        if (typeof error !== "string") throw new Error("Expected a text validation error");

        const parent: FormElement = {
          id: 2,
          type: FormElementTypes.dynamicRow,
          properties: {
            titleEn: "People",
            titleFr: "Personnes",
            validation: { required: false },
            subElements: [element],
          },
        };
        expect(isFieldResponseValid([{ 0: value }], parent, t)).toEqual([{ 0: error }]);

        const formatted = formatErrors(
          { 1: error, 2: [{ 0: error }] },
          [element, parent],
          language,
          t
        );
        render(
          <>
            <div>
              <ErrorListMessage
                id={1}
                defaultValue={String(formatted[1])}
                elements={[element]}
                language={language}
              />
            </div>
            <div>
              <ErrorListMessage
                id="2.0.0"
                defaultValue={String(formatted[1])}
                elements={[]}
                subElement={element}
                language={language}
              />
            </div>
          </>
        );
        expect(
          screen.getAllByText(
            `${expected.replace(/\.$/, "")}: ${language === "en" ? "Name" : "Nom"}`
          )
        ).toHaveLength(2);
        cleanup();
      }
    }
  );
});
