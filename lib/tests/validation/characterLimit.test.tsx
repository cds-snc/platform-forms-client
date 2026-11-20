/**
 * @vitest-environment jsdom
 */
import { createInstance } from "i18next";
import { FormElement, FormElementTypes } from "@gcforms/types";
import { isFieldResponseValid } from "../../../packages/core/src/validation/validation";
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

describe.each(["en", "fr"] as const)("character-limit errors (%s)", (language) => {
  test("preserves the combined hard-limit message and overflow count", async () => {
    await i18n.changeLanguage(language);
    const element: FormElement = {
      id: 1,
      type: FormElementTypes.textArea,
      properties: {
        titleEn: "Response",
        titleFr: "Réponse",
        validation: { required: false, maxLength: 2 },
      },
    };
    const error = isFieldResponseValid("x".repeat(10001), element);
    expect(error).toEqual({ code: "input-too-long", count: 1 });
    if (!error) throw new Error("Expected a validation error");
    const t = (key: string, options?: Record<string, unknown>) => i18n.t(key, options);
    const message =
      t("input-validation.too-many-characters") +
      " " +
      t("formElements.characterCount.exceeded", { count: 1 });
    expect(formatErrors({ 1: error }, [element], language, t)).toEqual({
      1: `${message.replace(/\.$/, "")}: ${language === "en" ? "Response" : "Réponse"}`,
    });
  });

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

      expect(isFieldResponseValid("ab", element)).toBeNull();
      for (const value of ["abc", "abcd"]) {
        const error = isFieldResponseValid(value, element);
        const expected = i18n.t("formElements.characterCount.exceeded", {
          count: value.length - 2,
        });
        expect(error).toEqual({ code: "max-length", count: value.length - 2 });
        if (!error) throw new Error("Expected a validation error");

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
        expect(isFieldResponseValid([{ 0: value }], parent)).toEqual([{ 0: error }]);

        const formatted = formatErrors(
          { 1: error, 2: [{ 0: error }] },
          [element, parent],
          language,
          t
        );
        const message = `${expected.replace(/\.$/, "")}: ${language === "en" ? "Name" : "Nom"}`;
        expect(formatted).toEqual({ 1: message, 2: [{ 0: message }] });
      }
    }
  );
});
