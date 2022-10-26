import { useAllowPublish } from "../hooks/useAllowPublish";
import { renderHook } from "@testing-library/react";

describe("useAllowPublish", () => {
  it("checks required fields needed to publish or save", () => {
    const store = {
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
            descriptionEn: "",
            descriptionFr: "",
          },
        },
      ],
      privacyPolicy: { descriptionEn: "", descriptionFr: "" },
      endPage: { descriptionEn: "confirm text en", descriptionFr: "confirm text fr" },
    };

    const {
      result: {
        current: { data, hasData, isSaveable },
      },
    } = renderHook(() => useAllowPublish(store));

    expect(data.title).toBe(true);
    expect(data.questions).toBe(true);
    expect(data.privacyPolicy).toBe(false);
    expect(hasData(["title"])).toBe(true);
    expect(hasData(["title", "questions"])).toBe(true);
    expect(hasData(["title", "privacyPolicy"])).toBe(false);
    expect(hasData(["title", "confirmationMessage"])).toBe(true);
    expect(isSaveable()).toBe(true);
  });
});
