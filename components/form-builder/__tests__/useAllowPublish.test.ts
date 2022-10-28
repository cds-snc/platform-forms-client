import useTemplateStore from "../store/useTemplateStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { renderHook } from "@testing-library/react";
import {
  isTitleTranslated,
  isDescriptionTranslated,
  isFormElementTranslated,
  areChoicesTranslated,
  MissingTranslationError,
} from "../hooks/useAllowPublish";

import { act } from "react-dom/test-utils";

const createStore = () => {
  const { result } = renderHook(() => useTemplateStore());
  act(() => {
    result.current.initialize();
  });

  return result;
};

describe("useAllowPublish", () => {
  it("checks required fields needed to publish or save", () => {
    const result = createStore();
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
            type: "",
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
      publishingStatus: true,
    };

    act(() => {
      result.current.importTemplate(store);
    });

    const {
      result: {
        current: { data, hasData, isSaveable, isPublishable },
      },
    } = renderHook(() => useAllowPublish());

    expect(data.title).toBe(true);
    expect(data.questions).toBe(true);
    expect(data.privacyPolicy).toBe(false);
    expect(result.current.form.elements[0].properties.descriptionEn).toBe("description en");
    expect(hasData(["title"])).toBe(true);
    expect(hasData(["title", "questions"])).toBe(true);
    expect(hasData(["title", "privacyPolicy"])).toBe(false);
    expect(hasData(["title", "confirmationMessage"])).toBe(true);
    expect(isSaveable()).toBe(true);
    expect(isPublishable()).toBe(false);
  });

  it("isPublishable", () => {
    const result = createStore();
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
            type: "",
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
      publishingStatus: true,
    };

    act(() => {
      result.current.importTemplate(store);
    });

    const {
      result: {
        current: { isPublishable },
      },
    } = renderHook(() => useAllowPublish());

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

      expect(notTranslated).toThrow(MissingTranslationError);

      const notProvided = () => {
        isTitleTranslated({
          titleEn: "",
          titleFr: "",
        });
      };

      expect(notProvided).toThrow(MissingTranslationError);
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

      expect(notTranslated).toThrow(MissingTranslationError);

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

      expect(notTranslated).toThrow(MissingTranslationError);

      const notProvided = () => {
        areChoicesTranslated([
          {
            en: "",
            fr: "",
          },
          {
            en: "",
            fr: "",
          },
        ]);
      };

      expect(notProvided).toThrow(MissingTranslationError);
    });

    it("isFormElementTranslated richText", () => {
      const translated = () => {
        isFormElementTranslated({
          id: 1,
          type: "richText",
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
          type: "richText",
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

      expect(notTranslated).toThrow(MissingTranslationError);

      const notProvided = () => {
        isFormElementTranslated({
          id: 1,
          type: "richText",
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

      expect(notProvided).toThrow(MissingTranslationError);
    });

    it("isFormElementTranslated other types", () => {
      const translated = () => {
        isFormElementTranslated({
          id: 1,
          type: "radio",
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
          type: "radio",
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

      expect(titleNotTranslated).toThrow(MissingTranslationError);
    });

    const descriptionNotProvided = () => {
      isFormElementTranslated({
        id: 1,
        type: "radio",
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
        type: "radio",
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
    expect(descriptionNotTranslated).toThrow(MissingTranslationError);

    const optionNotTranslated = () => {
      isFormElementTranslated({
        id: 1,
        type: "radio",
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

    expect(optionNotTranslated).toThrow(MissingTranslationError);

    const optionNotProvided = () => {
      isFormElementTranslated({
        id: 1,
        type: "radio",
        properties: {
          titleEn: "title",
          titleFr: "titlefr",
          descriptionEn: "description",
          descriptionFr: "descriptionfr",
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

    expect(optionNotProvided).toThrow(MissingTranslationError);
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
      publishingStatus: true,
    };

    it("fails when form title translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.titleFr = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });

    it("fails when form introduction translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.introduction.descriptionFr = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });

    it("fails when form privacyPolicy translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.privacyPolicy.descriptionEn = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });

    it("fails when form endPage translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.endPage.descriptionFr = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });

    it("fails when an element title translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.titleFr = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });

    it("passes when an optional element description is not set", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionEn = "";
      store.form.elements[0].properties.descriptionFr = "";

      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(true);
    });

    it("fails when an optional element description is provided but translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.descriptionFr = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });

    it("fails when a choice element translation is missing", () => {
      const result = createStore();
      const store = JSON.parse(JSON.stringify(defaultStore));

      store.form.elements[0].properties.choices[0].fr = "";
      act(() => {
        result.current.importTemplate(store);
      });

      const {
        result: {
          current: { data },
        },
      } = renderHook(() => useAllowPublish());

      expect(data.translate).toBe(false);
    });
  });
});
