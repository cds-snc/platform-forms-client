/**
 * @vitest-environment jsdom
 */
import {
  isTitleTranslated,
  isDescriptionTranslated,
  isFormElementTranslated,
  areChoicesTranslated,
  isFormTranslated,
  MissingTranslation,
} from "../form-builder/useAllowPublish";
import { FormElementTypes } from "@lib/types";

vi.mock("../useAccessControl", () => ({
  useAccessControl: () => ({
    ability: {
      can: () => true,
    },
  }),
}));

vi.mock("../useFormBuilderConfig", () => ({
  useFormBuilderConfig: () => ({
    apiKeyId: false,
    hasApiKeyId: false,
    updateApiKeyId: () => undefined,
  }),
}));

const localStorageMock = (() => {
  let store: Record<string, unknown> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, "sessionStorage", {
  value: localStorageMock,
});

describe("useAllowPublish", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.clearAllMocks();
  });

  describe("Translation helper methods", () => {
    it("isTitleTranslated", () => {
      const translated = () => {
        isTitleTranslated({
          titleEn: "title",
          titleFr: "titlefr",
        });
      };

      expect(translated).not.toThrow();

      const notTranslated = () => {
        isTitleTranslated({
          titleEn: "title",
          titleFr: "",
        });
      };

      expect(notTranslated).toThrow(MissingTranslation);

      const notProvided = () => {
        isTitleTranslated({
          titleEn: "",
          titleFr: "",
        });
      };

      expect(notProvided).toThrow(MissingTranslation);
    });

    it("isDescriptionTranslated", () => {
      const translated = () => {
        isDescriptionTranslated({
          descriptionEn: "description",
          descriptionFr: "descriptionfr",
        });
      };

      expect(translated).not.toThrow();

      const notTranslated = () => {
        isDescriptionTranslated({
          descriptionEn: "description",
          descriptionFr: "",
        });
      };

      expect(notTranslated).toThrow(MissingTranslation);

      const notProvided = () => {
        isDescriptionTranslated({
          descriptionEn: "description",
          descriptionFr: "descriptionfr",
        });
      };

      // Descriptions are optional
      expect(notProvided).not.toThrow();
    });

    it("areChoicesTranslated", () => {
      const translated = () => {
        areChoicesTranslated([
          {
            en: "label",
            fr: "labelfr",
          },
          {
            en: "label",
            fr: "labelfr",
          },
        ]);
      };

      expect(translated).not.toThrow();

      const notTranslated = () => {
        areChoicesTranslated([
          {
            en: "label",
            fr: "labelfr",
          },
          {
            en: "label",
            fr: "",
          },
        ]);
      };

      expect(notTranslated).toThrow(MissingTranslation);

      const notProvided = () => {
        areChoicesTranslated([
          {
            // no values provided to translate
            en: "",
            fr: "",
          },
          {
            en: "",
            fr: "",
          },
        ]);
      };

      expect(notProvided).not.toThrow();
    });

    it("isFormElementTranslated richText", () => {
      const translated = () => {
        isFormElementTranslated({
          id: 1,
          type: FormElementTypes.richText,
          properties: {
            titleEn: "",
            titleFr: "",
            descriptionEn: "description",
            descriptionFr: "descriptionfr",
            choices: [],
            validation: { required: false },
          },
        });
      };

      expect(translated).not.toThrow();

      const notTranslated = () => {
        isFormElementTranslated({
          id: 1,
          type: FormElementTypes.richText,
          properties: {
            titleEn: "",
            titleFr: "",
            descriptionEn: "description",
            descriptionFr: "",
            choices: [],
            validation: { required: false },
          },
        });
      };

      expect(notTranslated).toThrow(MissingTranslation);

      const notProvided = () => {
        isFormElementTranslated({
          id: 1,
          type: FormElementTypes.richText,
          properties: {
            titleEn: "",
            titleFr: "",
            descriptionEn: "",
            descriptionFr: "",
            choices: [],
            validation: { required: false },
          },
        });
      };

      expect(notProvided).toThrow(MissingTranslation);
    });

    it("isFormElementTranslated other types", () => {
      const translated = () => {
        isFormElementTranslated({
          id: 1,
          type: FormElementTypes.radio,
          properties: {
            titleEn: "title",
            titleFr: "titlefr",
            descriptionEn: "description",
            descriptionFr: "descriptionfr",
            choices: [
              {
                en: "option",
                fr: "optionfr",
              },
            ],
            validation: { required: false },
          },
        });
      };

      expect(translated).not.toThrow();

      const titleNotTranslated = () => {
        isFormElementTranslated({
          id: 1,
          type: FormElementTypes.radio,
          properties: {
            titleEn: "title",
            titleFr: "",
            descriptionEn: "description",
            descriptionFr: "descriptionfr",
            choices: [
              {
                en: "option",
                fr: "optionfr",
              },
            ],
            validation: { required: false },
          },
        });
      };

      expect(titleNotTranslated).toThrow(MissingTranslation);
    });

    const descriptionNotProvided = () => {
      isFormElementTranslated({
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "title",
          titleFr: "titlefr",
          descriptionEn: "",
          descriptionFr: "",
          choices: [
            {
              en: "option",
              fr: "optionfr",
            },
          ],
          validation: { required: false },
        },
      });
    };

    // Descriptions are optional
    expect(descriptionNotProvided).not.toThrow();

    const descriptionNotTranslated = () => {
      isFormElementTranslated({
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "title",
          titleFr: "titlefr",
          descriptionEn: "description",
          descriptionFr: "",
          choices: [
            {
              en: "option",
              fr: "optionfr",
            },
          ],
          validation: { required: false },
        },
      });
    };

    // If provided, Descriptions must be translated
    expect(descriptionNotTranslated).toThrow(MissingTranslation);

    const optionNotTranslated = () => {
      isFormElementTranslated({
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "title",
          titleFr: "titlefr",
          descriptionEn: "description",
          descriptionFr: "descriptionfr",
          choices: [
            {
              en: "option",
              fr: "",
            },
          ],
          validation: { required: false },
        },
      });
    };

    expect(optionNotTranslated).toThrow(MissingTranslation);

    const optionNotProvided = () => {
      isFormElementTranslated({
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "title",
          titleFr: "titlefr",
          descriptionEn: "description",
          descriptionFr: "descriptionfr",
          // no values provided to translate
          choices: [
            {
              en: "",
              fr: "",
            },
          ],
          validation: { required: false },
        },
      });
    };

    expect(optionNotProvided).not.toThrow();
  });

  describe("Validate form translated tests", () => {
    const defaultStore = {
      form: {
        titleEn: "form title",
        titleFr: "form title fr",
        introduction: {
          descriptionEn: "introduction text en",
          descriptionFr: "introduction text fr",
        },
        privacyPolicy: { descriptionEn: "privacy text en", descriptionFr: "privacy text fr" },
        confirmation: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
        layout: [],
        elements: [
          {
            id: 1,
            type: "radio",
            properties: {
              titleEn: "question 1",
              titleFr: "question 2",
              choices: [
                {
                  en: "choice 1",
                  fr: "choix 1",
                },
                {
                  en: "choice 1",
                  fr: "choix 1",
                },
              ],
              validation: { required: false },
              descriptionEn: "description en",
              descriptionFr: "description fr",
            },
          },
          {
            id: 2,
            type: "richText",
            properties: {
              validation: { required: false },
              descriptionEn: "description en",
              descriptionFr: "description fr",
            },
          },
        ],
      },
      isPublished: true,
      deliveryOption: {
        emailAddress: "test@example.com",
        emailSubjectEn: "email subject in English",
        emailSubjectFr: "email subject in French",
      },
    };

    it("fails when form title translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.titleFr = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });

    it("fails when form introduction translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.introduction.descriptionFr = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });

    it("fails when form privacyPolicy translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.privacyPolicy.descriptionEn = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });

    it("fails when form confirmation translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.confirmation.descriptionFr = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });

    it("fails when an element title translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.titleFr = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });

    it("passes when an optional element description is not set", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionEn = "";
      store.form.elements[0].properties.descriptionFr = "";

      expect(isFormTranslated(store.form)).toBe(true);
    });

    it("fails when an optional element description is provided but translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionFr = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });

    it("fails when a choice element translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.choices[0].fr = "";

      expect(isFormTranslated(store.form)).toBe(false);
    });
  });
});
