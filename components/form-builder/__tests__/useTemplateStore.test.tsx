import React from "react";
import { useTemplateStore, TemplateStoreProvider } from "../store/useTemplateStore";
import { renderHook, act } from "@testing-library/react";

const createStore = () => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <TemplateStoreProvider>{children}</TemplateStoreProvider>
  );

  const { result } = renderHook(() => useTemplateStore((s) => s), { wrapper });

  act(() => {
    result.current.initialize();
  });

  return result;
};

const promise = Promise.resolve();

describe("TemplateStore", () => {
  it("Updates the Element title", async () => {
    const result = createStore();

    expect(result.current.form.titleEn).toBe("");

    act(() => {
      result.current.updateField(
        `form.elements[1].properties.titleEn`,
        "updated element title!!!!"
      );
    });

    expect(result.current.form.elements[1].properties.titleEn).toBe("updated element title!!!!");

    await act(async () => {
      await promise;
    });
  });

  it("Adds default elements to the Form", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    // Add two elements
    act(() => {
      result.current.add();
      result.current.add();
    });

    expect(result.current.form.titleEn).toBe("");
    expect(result.current.form.elements).toHaveLength(2);
    expect(result.current.form.elements[1].properties.titleEn).toBe("");

    await act(async () => {
      await promise;
    });
  });

  it("Inserts elements after the specified item index", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    // Add multiple elements
    act(() => {
      result.current.add(0);
      result.current.add(1);
      result.current.add(2);
    });

    expect(result.current.form.elements[0].id).toBe(1);
    expect(result.current.form.elements[1].id).toBe(2);
    expect(result.current.form.elements[2].id).toBe(3);

    // Insert a new element between the first two
    act(() => {
      result.current.add(0);
    });

    expect(result.current.form.elements[0].id).toBe(1);
    expect(result.current.form.elements[1].id).toBe(4);
    expect(result.current.form.elements[2].id).toBe(2);
    expect(result.current.form.elements[3].id).toBe(3);

    await act(async () => {
      await promise;
    });
  });

  it("Adds Choices to an Element", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    // Add a default element
    act(() => {
      result.current.add();
    });

    // Default element expectations
    expect(result.current.form.titleEn).toBe("");
    expect(result.current.form.elements).toHaveLength(1);
    expect(result.current.form.elements[0].properties.titleEn).toBe("");
    // By default, there is one choice available
    expect(result.current.form.elements[0].properties.choices).toHaveLength(1);

    if (result.current.form.elements[0].properties.choices) {
      expect(result.current.form.elements[0].properties.choices[0]).toEqual({ en: "", fr: "" });
    } else {
      expect(result.current.form.elements[0].properties.choices).not.toBeFalsy(); // fails if it is called
    }

    // Add a choice to the element
    act(() => {
      result.current.addChoice(0);
    });

    // Default choice expectations
    expect(result.current.form.elements[0].properties.choices).toHaveLength(2);

    if (result.current.form.elements[0].properties.choices) {
      expect(result.current.form.elements[0].properties.choices[1]).toEqual({ en: "", fr: "" });
    } else {
      expect(result.current.form.elements[0].properties.choices).not.toBeFalsy(); // fails if it is called
    }

    await act(async () => {
      await promise;
    });
  });

  it("Updates existing choices", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    act(() => {
      result.current.add();
      result.current.updateField(`form.elements[0].properties.choices[0].en`, "option 1!!");
      result.current.updateField(`form.elements[0].properties.choices[0].fr`, "l’option 1!!");
    });

    if (result.current.form.elements[0].properties.choices) {
      expect(result.current.form.elements[0].properties.choices[0]).toEqual({
        en: "option 1!!",
        fr: "l’option 1!!",
      });
    } else {
      expect(result.current.form.elements[0].properties.choices).not.toBeFalsy(); // fails if it is called
    }

    await act(async () => {
      await promise;
    });
  });

  it("Removes choices", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    // Create an element with three choices
    act(() => {
      result.current.add(); // one choices is added by default
      result.current.addChoice(0);
      result.current.addChoice(0);
    });

    expect(result.current.form.elements[0].properties.choices).toHaveLength(3);

    // Remove one choice
    act(() => {
      result.current.removeChoice(0, 0);
    });

    expect(result.current.form.elements[0].properties.choices).toHaveLength(2);

    await act(async () => {
      await promise;
    });
  });

  it("Duplicates an element and inserts after index of copied item", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    // Create an element with three choices
    act(() => {
      result.current.add(0);
      result.current.add(1);
      result.current.add(2);

      result.current.updateField(`form.elements[0].properties.titleEn`, "Element one");
      result.current.updateField(`form.elements[1].properties.titleEn`, "Element two");
      result.current.updateField(`form.elements[2].properties.titleEn`, "Element three");
    });

    expect(result.current.form.elements).toHaveLength(3);

    act(() => {
      result.current.duplicateElement(1);
    });

    expect(result.current.form.elements).toHaveLength(4);
    expect(result.current.form.elements[2].properties.titleEn).toBe("Element two copy");
    expect(result.current.form.elements[3].properties.titleEn).toBe("Element three");

    await act(async () => {
      await promise;
    });
  });

  it("Moves an element up", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    act(() => {
      result.current.add(0);
      result.current.add(1);
      result.current.add(2);
    });

    expect(result.current.form.elements[0].id).toBe(1);
    expect(result.current.form.elements[1].id).toBe(2);
    expect(result.current.form.elements[2].id).toBe(3);

    act(() => {
      result.current.moveUp(2);
    });

    expect(result.current.form.elements[0].id).toBe(1);
    expect(result.current.form.elements[1].id).toBe(3);
    expect(result.current.form.elements[2].id).toBe(2);

    await act(async () => {
      await promise;
    });
  });

  it("Moves an element down", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    act(() => {
      result.current.add(0);
      result.current.add(1);
      result.current.add(2);
    });

    expect(result.current.form.elements[0].id).toBe(1);
    expect(result.current.form.elements[1].id).toBe(2);
    expect(result.current.form.elements[2].id).toBe(3);

    act(() => {
      result.current.moveDown(0);
    });

    expect(result.current.form.elements[0].id).toBe(2);
    expect(result.current.form.elements[1].id).toBe(1);
    expect(result.current.form.elements[2].id).toBe(3);

    await act(async () => {
      await promise;
    });
  });

  it("Adds a validation type", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    act(() => {
      result.current.add(0);
      result.current.updateField(`form.elements[0].type`, "textField");
      result.current.updateField(`form.elements[0].properties.validation.type`, "email");
    });

    expect(result.current.form.elements[0].type).toBe("textField");
    if (result.current.form.elements[0].properties.validation) {
      expect(result.current.form.elements[0].properties.validation.required).toBe(false);
      expect(result.current.form.elements[0].properties.validation.type).toBe("email");
    } else {
      expect(result.current.form.elements[0].properties.validation).not.toBeFalsy(); // fails if it is called
    }

    await act(async () => {
      await promise;
    });
  });

  it("Removes a validation type", async () => {
    const result = createStore();
    expect(result.current.form.titleEn).toBe("");

    act(() => {
      result.current.add(0);
      result.current.updateField(`form.elements[0].type`, "textField");
      result.current.updateField(`form.elements[0].properties.validation.type`, "email");
    });

    expect(result.current.form.elements[0].type).toBe("textField");
    if (result.current.form.elements[0].properties.validation) {
      expect(result.current.form.elements[0].properties.validation.required).toBe(false);
      expect(result.current.form.elements[0].properties.validation.type).toBe("email");
    } else {
      expect(result.current.form.elements[0].properties.validation).not.toBeFalsy(); // fails if it is called
    }

    act(() => {
      result.current.unsetField(`form.elements[0].properties.validation.type`);
    });

    if (result.current.form.elements[0].properties.validation) {
      expect(result.current.form.elements[0].properties.validation.required).toBe(false);
      expect(result.current.form.elements[0].properties.validation.type).toBeUndefined();
    } else {
      expect(result.current.form.elements[0].properties.validation).not.toBeFalsy(); // fails if it is called
    }

    await act(async () => {
      await promise;
    });
  });

  it("Initializes the default form", async () => {
    const result = createStore();

    // Initial state
    expect(result.current.form.titleEn).toBe("");
    expect(result.current.form.elements.length).toBe(0);

    // Make some changes to the form
    act(() => {
      result.current.updateField(`form.titleEn`, "New Form Title");
      result.current.add();
      result.current.add();
      result.current.add();
    });

    expect(result.current.form.titleEn).toBe("New Form Title");
    expect(result.current.form.elements).toHaveLength(3);

    // Re-initialize the form
    act(() => {
      result.current.initialize();
    });

    expect(result.current.form.titleEn).toBe("");
    expect(result.current.form.elements.length).toBe(0);

    await act(async () => {
      await promise;
    });
  });

  it("Creates localized property", async () => {
    const result = createStore();
    let titleProp = "";
    let descProp = "";

    act(() => {
      titleProp = result.current.localizeField("title");
      descProp = result.current.localizeField("description");
    });

    expect(titleProp).toBe("titleEn");
    expect(descProp).toBe("descriptionEn");

    act(() => {
      result.current.toggleLang();
      titleProp = result.current.localizeField("title");
      descProp = result.current.localizeField("description");
    });

    expect(titleProp).toBe("titleFr");
    expect(descProp).toBe("descriptionFr");

    await act(async () => {
      await promise;
    });
  });
});
