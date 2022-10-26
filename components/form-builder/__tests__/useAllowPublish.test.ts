import useTemplateStore from "../store/useTemplateStore";
import { useAllowPlublish } from "../hooks/useAllowPublish";
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
  it("checks", () => {
    const result = createStore();
    const {
      result: {
        current: { data, hasData },
      },
    } = renderHook(() => useAllowPlublish());

    expect(result.current.form.titleEn).toBe("My Form");

    act(() => {
      result.current.updateField(`form.titleEn`, "form title has value");

      result.current.updateField(`form.elements[1].properties.titleEn`, "element title");

      result.current.updateField(`form.endPage.descriptionEn`, "end page has value");
    });

    expect(result.current.form.titleEn).toBe("form title has value");
    expect(result.current.form.elements[1].properties.titleEn).toBe("element title");
    expect(result.current.form.endPage.descriptionEn).toBe("end page has value");

    expect(hasData(["title"])).toBe(true);
    expect(data.title).toBe(true);
    // expect(hasData(["title", "questions"])).toBe(true);
    // expect(hasData(["title", "privacyPolicy"])).toBe(false);
  });
});
