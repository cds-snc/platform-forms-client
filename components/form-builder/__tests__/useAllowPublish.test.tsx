import React from "react";
import { TemplateStoreProvider, TemplateStoreProps } from "../store/useTemplateStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { renderHook } from "@testing-library/react";
import {
  isTitleTranslated,
  isDescriptionTranslated,
  isFormElementTranslated,
  areChoicesTranslated,
  MissingTranslation,
} from "../hooks/useAllowPublish";
import { FormElementTypes } from "@lib/types";

const createTemplateStore = ({ form, submission, isPublished }: Partial<TemplateStoreProps>) => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <TemplateStoreProvider form={form} submission={submission} isPublished={isPublished}>
      {children}
    </TemplateStoreProvider>
  );
  const { result } = renderHook(() => useAllowPublish(), { wrapper });

  return result;
};

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
    jest.restoreAllMocks();
  });

  it("checks required fields needed to publish or save", () => {
    const store = {
      form: {
        version: 1,
        layout: [],
        introduction: {
          descriptionEn: "",
          descriptionFr: "",
        },
        titleEn: "form title",
        titleFr: "",
        elements: [
          {
            id: 1,
            type: FormElementTypes.radio,
            properties: {
              titleEn: "question 1",
              titleFr: "question 2",
              choices: [],
              validation: { required: false },
              descriptionEn: "description en",
              descriptionFr: "descrption fr",
            },
          },
        ],
        privacyPolicy: { descriptionEn: "", descriptionFr: "" },
        endPage: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
      },
      submission: { email: "test@example.com" },
      isPublished: true,
    };
    const {
      current: { data, hasData, isSaveable, isPublishable },
    } = createTemplateStore({
      form: store.form,
      submission: store.submission,
      isPublished: store.isPublished,
    });

    expect(data.title).toBe(true);
    expect(data.questions).toBe(true);
    expect(data.privacyPolicy).toBe(false);
    expect(hasData(["title"])).toBe(true);
    expect(hasData(["title", "questions"])).toBe(true);
    expect(hasData(["title", "privacyPolicy"])).toBe(false);
    expect(hasData(["title", "confirmationMessage"])).toBe(true);
    expect(isSaveable()).toBe(true);
    expect(isPublishable()).toBe(false);
  });

  it("isPublishable", () => {
    const store = {
      form: {
        version: 1,
        layout: [],
        introduction: {
          descriptionEn: "introduction text en",
          descriptionFr: "introduction text fr",
        },
        titleEn: "form title",
        titleFr: "form title fr",
        elements: [
          {
            id: 1,
            type: FormElementTypes.radio,
            properties: {
              titleEn: "question 1",
              titleFr: "question 2",
              choices: [],
              validation: { required: false },
              descriptionEn: "description en",
              descriptionFr: "description fr",
            },
          },
        ],
        privacyPolicy: { descriptionEn: "privacy text en", descriptionFr: "privacy text fr" },
        endPage: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
      },
      submission: { email: "test@example.com" },
      isPublished: true,
    };
    const {
      current: { isPublishable },
    } = createTemplateStore({
      form: store.form,
      submission: store.submission,
      isPublished: store.isPublished,
    });

    expect(isPublishable()).toBe(true);
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
        version: 1,
        layout: [],
        introduction: {
          descriptionEn: "introduction text en",
          descriptionFr: "introduction text fr",
        },
        titleEn: "form title",
        titleFr: "form title fr",
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
        privacyPolicy: { descriptionEn: "privacy text en", descriptionFr: "privacy text fr" },
        endPage: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
      },
      submission: { email: "test@example.com" },
    };

    it("fails when form title translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.titleFr = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });
      expect(data.translate).toBe(false);
    });

    it("fails when form introduction translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.introduction.descriptionFr = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(false);
    });

    it("fails when form privacyPolicy translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.privacyPolicy.descriptionEn = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(false);
    });

    it("fails when form endPage translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.endPage.descriptionFr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(false);
    });

    it("fails when an element title translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.titleFr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(false);
    });

    it("passes when an optional element description is not set", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionEn = "";
      store.form.elements[0].properties.descriptionFr = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(true);
    });

    it("fails when an optional element description is provided but translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionFr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(false);
    });

    it("fails when a choice element translation is missing", () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.choices[0].fr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        submission: store.submission,
        isPublished: store.isPublished,
      });

      expect(data.translate).toBe(false);
    });
  });
});
