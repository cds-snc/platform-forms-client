import useTemplateStore from "../store/useTemplateStore";
import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";

const createStore = () => {
  const { result } = renderHook(() => useTemplateStore());
  act(() => {
    result.current.initialize();
  });

  return result;
};

describe("TemplateStore", () => {
  it("Updates the Form title", () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("My Form");

    act(() => {
      result.current.updateField(
        `form.elements[1].properties.titleEn`,
        "updated element title!!!!"
      );
    });

    expect(result.current.form.elements[1].properties.titleEn).toBe("updated element title!!!!");
  });

  it("Adds default elements to the Form", () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("My Form");

    // Add two elements
    act(() => {
      result.current.add();
      result.current.add();
    });

    expect(result.current.form.titleEn).toBe("My Form");
    expect(result.current.form.elements).toHaveLength(2);
    expect(result.current.form.elements[1].properties.titleEn).toBe("");
  });

  it("Adds Choices to an Element", () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("My Form");

    // Add a default element
    act(() => {
      result.current.add();
    });

    // Default element expectations
    expect(result.current.form.titleEn).toBe("My Form");
    expect(result.current.form.elements).toHaveLength(1);
    expect(result.current.form.elements[0].properties.titleEn).toBe("");
    expect(result.current.form.elements[0].properties.choices).toHaveLength(0);

    // Add a choice to the element
    act(() => {
      result.current.addChoice(0);
    });

    // Default choice expectations
    expect(result.current.form.elements[0].properties.choices).toHaveLength(1);
    expect(result.current.form.elements[0].properties.choices[0]).toEqual({ en: "", fr: "" });
  });

  it("Updates existing choices", () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("My Form");

    act(() => {
      result.current.add();
      result.current.updateField(`form.elements[0].properties.choices[0].en`, "option 1!!");
      result.current.updateField(`form.elements[0].properties.choices[0].fr`, "l’option 1!!");
    });

    expect(result.current.form.elements[0].properties.choices[0]).toEqual({
      en: "option 1!!",
      fr: "l’option 1!!",
    });
  });

  it("Removes choices", () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("My Form");

    // Create an element with two choices
    act(() => {
      result.current.add();
      result.current.addChoice(0);
      result.current.addChoice(0);
    });

    expect(result.current.form.elements[0].properties.choices).toHaveLength(2);

    // Remove one choice
    act(() => {
      result.current.removeChoice(0, 0);
    });

    expect(result.current.form.elements[0].properties.choices).toHaveLength(1);
  });
});
