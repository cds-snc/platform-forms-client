import useModalStore, { defaultProperties } from "../store/useModalStore";
import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";

const createStore = () => {
  const { result } = renderHook(() => useModalStore());

  act(() => {
    result.current.initialize();
  });

  return result;
};

describe("ModalStore", () => {
  it("Updates isOpen", () => {
    const result = createStore();
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.updateIsOpen(true);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("Updates existing modal", () => {
    const result = createStore();
    expect(result.current.modals.length).toBe(1);
    expect(result.current.modals[0].descriptionEn).toEqual("");
    expect(result.current.modals[0].descriptionFr).toEqual("");

    act(() => {
      result.current.updateModalProperties(0, {
        ...defaultProperties,
        descriptionEn: "This is my description",
        descriptionFr: "Voici ma description",
      });
    });

    expect(result.current.modals[0].descriptionEn).toEqual("This is my description");
    expect(result.current.modals[0].descriptionFr).toEqual("Voici ma description");
  });

  it("Adds new modal", () => {
    const result = createStore();
    expect(result.current.modals.length).toBe(1);
    expect(result.current.modals[1]).toBeUndefined();

    act(() => {
      result.current.updateModalProperties(1, {
        ...defaultProperties,
        descriptionEn: "1: This is my description",
      });
    });

    expect(result.current.modals.length).toBe(2);
    expect(result.current.modals[0].descriptionEn).toEqual("");
    expect(result.current.modals[1].descriptionEn).toEqual("1: This is my description");
  });

  it("Adds new modal out of order", () => {
    const result = createStore();
    expect(result.current.modals.length).toBe(1);
    expect(result.current.modals[1]).toBeUndefined();

    act(() => {
      result.current.updateModalProperties(100, {
        ...defaultProperties,
        descriptionEn: "100: This is my description",
      });
    });

    expect(result.current.modals.length).toBe(101);
    expect(result.current.modals[0].descriptionEn).toEqual("");
    expect(result.current.modals[1]).toBeUndefined();
    expect(result.current.modals[100].descriptionEn).toEqual("100: This is my description");
  });
});
