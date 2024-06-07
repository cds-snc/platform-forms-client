"use client";
import React from "react";
import { TemplateStoreProvider } from "../../store/useTemplateStore";
import { TemplateStoreProps } from "../../store/types";
import { useAllowPublish } from "../form-builder/useAllowPublish";
import { renderHook, act } from "@testing-library/react";
import {
  isTitleTranslated,
  isDescriptionTranslated,
  isFormElementTranslated,
  areChoicesTranslated,
  MissingTranslation,
} from "../form-builder/useAllowPublish";
import { FormElementTypes } from "@lib/types";
const promise = Promise.resolve();

const createTemplateStore = ({
  form,
  deliveryOption,
  isPublished,
}: Partial<TemplateStoreProps>) => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <TemplateStoreProvider form={form} deliveryOption={deliveryOption} isPublished={isPublished}>
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

  it("checks required fields needed to publish or save", async () => {
    const store = {
      form: {
        titleEn: "form title",
        titleFr: "",
        introduction: {
          descriptionEn: "",
          descriptionFr: "",
        },
        privacyPolicy: { descriptionEn: "", descriptionFr: "" },
        confirmation: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
        layout: [],
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
      },
      isPublished: true,
      deliveryOption: {
        emailAddress: "test@example.com",
        emailSubjectEn: "email subject in English",
        emailSubjectFr: "email subject in French",
      },
    };
    const {
      current: { data, hasData, isPublishable },
    } = createTemplateStore({
      form: store.form,
      isPublished: store.isPublished,
      deliveryOption: store.deliveryOption,
    });

    expect(data.title).toBe(true);
    expect(data.questions).toBe(true);
    expect(data.privacyPolicy).toBe(false);
    expect(hasData(["title"])).toBe(true);
    expect(hasData(["title", "questions"])).toBe(true);
    expect(hasData(["title", "privacyPolicy"])).toBe(false);
    expect(hasData(["title", "confirmationMessage"])).toBe(true);
    expect(isPublishable()).toBe(false);

    // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
    // > especially if there's no visual indication of the async task completing.
    await act(async () => {
      await promise;
    });
  });

  it("isPublishable", async () => {
    const store = {
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
      },
      formPurpose: "",
      isPublished: true,
      deliveryOption: {
        emailAddress: "test@example.com",
        emailSubjectEn: "email subject in English",
        emailSubjectFr: "email subject in French",
      },
    };
    const {
      current: { isPublishable, data },
    } = createTemplateStore({
      form: store.form,
      isPublished: store.isPublished,
      deliveryOption: store.deliveryOption,
    });

    // For test purposes, set purpose to true
    // In the UI this happens under the settings page
    act(() => {
      data.purpose = true
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

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });
      expect(data.translate).toBe(false);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });

    it("fails when form introduction translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.introduction.descriptionFr = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(false);

      await act(async () => {
        await promise;
      });
    });

    it("fails when form privacyPolicy translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.privacyPolicy.descriptionEn = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(false);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });

    it("fails when form confirmation translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.confirmation.descriptionFr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(false);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });

    it("fails when an element title translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.titleFr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(false);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });

    it("passes when an optional element description is not set", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionEn = "";
      store.form.elements[0].properties.descriptionFr = "";

      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(true);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });

    it("fails when an optional element description is provided but translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionFr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(false);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });

    it("fails when a choice element translation is missing", async () => {
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.choices[0].fr = "";
      const {
        current: { data },
      } = createTemplateStore({
        form: store.form,
        isPublished: store.isPublished,
        deliveryOption: store.deliveryOption,
      });

      expect(data.translate).toBe(false);

      // see: https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning#an-alternative-waiting-for-the-mocked-promise
      // > especially if there's no visual indication of the async task completing.
      await act(async () => {
        await promise;
      });
    });
  });
});
