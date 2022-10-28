import useTemplateStore from "../store/useTemplateStore";
import { useAllowPublish } from "../hooks/useAllowPublish";
import { renderHook } from "@testing-library/react";

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

  describe("translation tests", () => {
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
