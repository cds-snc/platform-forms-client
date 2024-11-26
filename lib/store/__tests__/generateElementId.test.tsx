/**
 * @jest-environment jsdom
 */
import React from "react";
import { useTemplateStore, TemplateStoreProvider } from "../useTemplateStore";
import { renderHook, act } from "@testing-library/react";
import { FormElementTypes } from "@lib/types";

const createStore = () => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <TemplateStoreProvider isPublished={false}>{children}</TemplateStoreProvider>
  );

  const { result } = renderHook(() => useTemplateStore((s) => s), { wrapper });

  act(() => {
    result.current.initialize();
  });

  return result;
};

const defaultElements = [
  {
    id: 1,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "question 1 fr",
      titleFr: "question 1 fr",
      choices: [],
      validation: { required: false },
      descriptionEn: "description en",
      descriptionFr: "descrption fr",
    },
  },
  {
    id: 2,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "question 2 en",
      titleFr: "question 2 fr",
      choices: [],
      validation: { required: false },
      descriptionEn: "description en",
      descriptionFr: "descrption fr",
    },
  },
  {
    id: 3,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "question 3 en",
      titleFr: "question 3 fr",
      choices: [],
      validation: { required: false },
      descriptionEn: "description en",
      descriptionFr: "descrption fr",
    },
  },
];

describe("generateElementId", () => {
  it("existing ids in order", async () => {
    const result = createStore();

    result.current.form = {
      titleEn: "Title en",
      titleFr: "Title fr",
      elements: defaultElements, layout: []
    };

    // Ensure we have a default form to work with
    expect(result.current.form.titleEn).toBe("Title en");
    expect(result.current.form.titleFr).toBe("Title fr");
    expect(result.current.form.elements[0].id).toBe(1);
    expect(result.current.form.elements[1].id).toBe(2);
    expect(result.current.form.elements[2].id).toBe(3);
    expect(result.current.form.lastGeneratedElementId).toBe(undefined);

    act(() => {
      result.current.add(1);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(4);

    act(() => {
      result.current.add(3);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(5);
  });

  it("handles ids out of sequence", async () => {
    const result = createStore();
    const element = {
      id: 19, // <-- This is out of sequence
      type: FormElementTypes.textField,
      properties: {
        titleEn: "question 19 en",
        titleFr: "question 19 fr",
        choices: [],
        validation: { required: false },
        descriptionEn: "description en",
        descriptionFr: "descrption fr",
      },
    };

    result.current.form = {
      titleEn: "Title en",
      titleFr: "Title fr",
      // Add element with ID of 19 at the start
      elements: [element, ...defaultElements], layout: []
    };

    // Ensure we have a default form to work with
    expect(result.current.form.titleEn).toBe("Title en");
    expect(result.current.form.titleFr).toBe("Title fr");

    act(() => {
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(20);

    act(() => {
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(21);
  });

  it("handles deleting an element", async () => {
    const result = createStore();

    result.current.form = {
      titleEn: "Title en",
      titleFr: "Title fr",
      // Add element with ID of 19 at the start
      elements: defaultElements, layout: []
    };

    // Ensure we have a default form to work with
    expect(result.current.form.titleEn).toBe("Title en");
    expect(result.current.form.titleFr).toBe("Title fr");

    act(() => {
      // This will add an element with ID of 4
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(4);

    act(() => {
      // Remove an element
      result.current.remove(1);
      // Adding annother item should increment the lastGeneratedElementId by 1
      // and not reuse the ID of the deleted element
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(5);
  });

  it("handles starting a form from scratch", async () => {
    const result = createStore();

    result.current.form = {
      titleEn: "Title en",
      titleFr: "Title fr",
      elements: [], layout: []
    };

    // Ensure we have a default form to work with
    expect(result.current.form.titleEn).toBe("Title en");
    expect(result.current.form.titleFr).toBe("Title fr");

    act(() => {
      // This will add an element with ID of 4
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(1);


    act(() => {
      result.current.add(0);
      result.current.add(0);
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(4);

    act(() => {
      result.current.remove(2);
      result.current.remove(3);
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(5);

    // Move items
    act(() => {
      result.current.moveDown(4);
      result.current.add(0);
    });

    expect(result.current.form.lastGeneratedElementId).toBe(6);

  });

});
