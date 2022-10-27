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
});
