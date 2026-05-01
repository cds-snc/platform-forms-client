/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";

import { defaultForm } from "../../store/defaults";
import { FormElement, FormElementTypes } from "@lib/types";
import { useAllowPublish } from "../form-builder/useAllowPublish";

type MockForm = Omit<typeof defaultForm, "elements"> & {
  elements: FormElement[];
};

const mockState = vi.hoisted(() => ({
  store: {
    form: null as unknown,
    formPurpose: "",
  },
  canPublish: true,
  hasApiKeyId: false,
}));

vi.mock("../useAccessControl", () => ({
  useAccessControl: () => ({
    ability: {
      can: () => mockState.canPublish,
    },
  }),
}));

vi.mock("../useFormBuilderConfig", () => ({
  useFormBuilderConfig: () => ({
    apiKeyId: mockState.hasApiKeyId ? "api-key-id" : false,
    hasApiKeyId: mockState.hasApiKeyId,
    updateApiKeyId: () => undefined,
  }),
}));

vi.mock("../../store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: typeof mockState.store) => unknown) => selector(mockState.store),
}));

const createTranslatedForm = (): MockForm => ({
  ...structuredClone(defaultForm),
  titleEn: "Form title",
  titleFr: "Titre du formulaire",
  privacyPolicy: {
    descriptionEn: "Privacy statement",
    descriptionFr: "Avis de confidentialite",
  },
  confirmation: {
    descriptionEn: "Confirmation message",
    descriptionFr: "Message de confirmation",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  elements: [
    {
      id: 1,
      type: FormElementTypes.radio,
      properties: {
        titleEn: "Question",
        titleFr: "Question FR",
        descriptionEn: "Description",
        descriptionFr: "Description FR",
        choices: [
          { en: "Option 1", fr: "Option 1 FR" },
          { en: "Option 2", fr: "Option 2 FR" },
        ],
        validation: { required: false },
        subElements: [],
      },
    },
  ],
});

const getMockForm = (): MockForm => {
  return mockState.store.form as MockForm;
};

const getUncheckedItems = (data: Record<string, boolean>) =>
  Object.entries(data)
    .filter(([, passed]) => !passed)
    .map(([key]) => key)
    .sort();

describe("useAllowPublish error list coverage", () => {
  beforeEach(() => {
    mockState.store = {
      form: createTranslatedForm(),
      formPurpose: "admin",
    };
    mockState.canPublish = true;
    mockState.hasApiKeyId = false;
  });

  it("returns no missing checklist items for a publishable form", () => {
    const { result } = renderHook(() => useAllowPublish());

    expect(getUncheckedItems(result.current.data)).toEqual([]);
    expect(
      result.current.hasData([
        "title",
        "questions",
        "privacyPolicy",
        "confirmationMessage",
        "translate",
      ])
    ).toBe(true);
    expect(result.current.isPublishable()).toBe(true);
    expect(result.current.userCanPublish).toBe(true);
  });

  it("surfaces the missing checklist items for an incomplete form", () => {
    mockState.store = {
      form: structuredClone(defaultForm),
      formPurpose: "",
    };

    const { result } = renderHook(() => useAllowPublish());

    expect(getUncheckedItems(result.current.data)).toEqual([
      "confirmationMessage",
      "privacyPolicy",
      "purpose",
      "questions",
      "title",
      "translate",
    ]);
    expect(result.current.isPublishable()).toBe(false);
  });

  it("keeps the translation error in the checklist when localized content is incomplete", () => {
    const firstChoice = getMockForm().elements[0]?.properties.choices?.[0];
    expect(firstChoice).toBeDefined();
    firstChoice!.fr = "";

    const { result } = renderHook(() => useAllowPublish());

    expect(getUncheckedItems(result.current.data)).toEqual(["translate"]);
    expect(
      result.current.hasData([
        "title",
        "questions",
        "privacyPolicy",
        "confirmationMessage",
      ])
    ).toBe(true);
    expect(result.current.isPublishable()).toBe(false);
  });

  it("adds the API key checklist error when file inputs are present without an API key", () => {
    getMockForm().elements.push({
      id: 2,
      type: FormElementTypes.fileInput,
      properties: {
        titleEn: "Upload a file",
        titleFr: "Televerser un fichier",
        descriptionEn: "",
        descriptionFr: "",
        choices: [],
        validation: { required: false },
        subElements: [],
      },
    });

    const { result } = renderHook(() => useAllowPublish());

    expect(result.current.hasFileInputElement).toBe(true);
    expect(result.current.hasApiKeyId).toBe(false);
    expect(getUncheckedItems(result.current.data)).toEqual(["hasFileInputAndApiKey"]);
    expect(result.current.isPublishable()).toBe(false);
  });
});