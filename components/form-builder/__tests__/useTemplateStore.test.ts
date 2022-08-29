import useTemplateStore from "../store/useTemplateStore";
import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";

describe("Store", () => {
  it("Updates store using useTemplateStore actions", () => {
    const { result } = renderHook(() => useTemplateStore());
    expect(result.current.form.titleEn).toBe("My Form");

    act(() => {
      result.current.add();
      result.current.add();
    });

    expect(result.current.form.titleEn).toBe("My Form");
    expect(result.current.form.elements).toHaveLength(2);
    expect(result.current.form.elements[1].properties.titleEn).toBe("");

    act(() => {
      result.current.updateField(
        `form.elements[1].properties.titleEn`,
        "updated element title!!!!"
      );
    });

    expect(result.current.form.elements[1].properties.titleEn).toBe("updated element title!!!!");
    expect(result.current.form.elements[1].properties.choices).toHaveLength(0);
    act(() => {
      result.current.addChoice(1);
    });

    expect(result.current.form.elements[1].properties.choices).toHaveLength(1);
    expect(result.current.form.elements[1].properties.choices[0]).toEqual({ en: "", fr: "" });

    act(() => {
      result.current.updateField(`form.elements[1].properties.choices[0].en`, "option 1!!");
      result.current.updateField(`form.elements[1].properties.choices[0].fr`, "l’option 1!!");
    });

    expect(result.current.form.elements[1].properties.choices[0]).toEqual({
      en: "option 1!!",
      fr: "l’option 1!!",
    });

    act(() => {
      result.current.removeChoice(1, 0);
    });

    expect(result.current.form.elements[1].properties.choices).toHaveLength(0);

    act(() => {
      result.current.remove(2);
    });

    expect(result.current.form.elements).toHaveLength(1);
  });
});
