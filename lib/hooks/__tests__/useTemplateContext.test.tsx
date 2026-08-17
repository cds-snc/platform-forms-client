/**
 * @vitest-environment jsdom
 */
import React from "react";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SaveTemplateProvider,
  useTemplateContext,
} from "@lib/hooks/form-builder/useTemplateContext";
import { FormProperties } from "@lib/types";

type OperationResult = {
  formRecord: {
    id: string;
    updatedAt: string;
  } | null;
  error?: string;
};

const { createOrUpdateTemplateMock, mockStore, subscribeMock } = vi.hoisted(() => ({
  createOrUpdateTemplateMock:
    vi.fn<(input: { formConfig: FormProperties }) => Promise<OperationResult>>(),
  mockStore: {
    getDeliveryOption: vi.fn(() => undefined),
    getId: vi.fn(() => "form-1"),
    getName: vi.fn(() => "Test form"),
    getSchema: vi.fn(() => "{}"),
    hasHydrated: true,
    isLockedByOther: false,
    notificationsInterval: undefined,
    securityAttribute: undefined,
    setFromRecord: vi.fn(),
  },
  subscribeMock: vi.fn(),
}));

vi.mock("@formBuilder/actions", () => ({
  createOrUpdateTemplate: createOrUpdateTemplateMock,
}));

vi.mock("@lib/store/useTemplateStore", () => ({
  useTemplateStore: (selector: (state: typeof mockStore) => unknown) => selector(mockStore),
}));

vi.mock("@lib/store/hooks/useSubscibeToTemplateStore", () => ({
  useSubscibeToTemplateStore: subscribeMock,
}));

describe("useTemplateContext saveDraft concurrency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeMock.mockImplementation(() => undefined);
    mockStore.getId.mockReturnValue("form-1");
    mockStore.getSchema.mockReturnValue("{}");
    mockStore.isLockedByOther = false;
  });

  it("coalesces overlapping saveDraft calls into a single write for unchanged drafts", async () => {
    let resolveSave: ((result: OperationResult) => void) | undefined;

    createOrUpdateTemplateMock.mockImplementation(
      () =>
        new Promise<OperationResult>((resolve) => {
          resolveSave = resolve;
        })
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SaveTemplateProvider>{children}</SaveTemplateProvider>
    );

    const { result } = renderHook(() => useTemplateContext(), { wrapper });

    let firstSavePromise!: Promise<{ status: string; formId?: string }>;
    let secondSavePromise!: Promise<{ status: string; formId?: string }>;

    await act(async () => {
      firstSavePromise = result.current.saveDraft();
      secondSavePromise = result.current.saveDraft();
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave?.({
        formRecord: {
          id: "form-1",
          updatedAt: new Date().toISOString(),
        },
      });

      const [firstResult, secondResult] = await Promise.all([firstSavePromise, secondSavePromise]);

      expect(firstResult.status).toBe("saved");
      expect(secondResult.status).toBe("saved");
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(1);
  });

  it("resolves a burst of queued saveDraft calls with a single write for unchanged drafts", async () => {
    let resolveSave: ((result: OperationResult) => void) | undefined;

    createOrUpdateTemplateMock.mockImplementation(
      () =>
        new Promise<OperationResult>((resolve) => {
          resolveSave = resolve;
        })
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SaveTemplateProvider>{children}</SaveTemplateProvider>
    );

    const { result } = renderHook(() => useTemplateContext(), { wrapper });

    const queuedSaveCount = 25;
    let savePromises: Array<Promise<{ status: string; formId?: string }>> = [];

    await act(async () => {
      savePromises = Array.from({ length: queuedSaveCount }, () => result.current.saveDraft());
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave?.({
        formRecord: {
          id: "form-1",
          updatedAt: new Date().toISOString(),
        },
      });

      const results = await Promise.all(savePromises);

      expect(results).toHaveLength(queuedSaveCount);
      for (const saveResult of results) {
        expect(saveResult.status).toBe("saved");
      }
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(1);
  });

  it("runs exactly one trailing write when a local edit appears while a save is in flight", async () => {
    let resolveFirstSave: ((result: OperationResult) => void) | undefined;
    let resolveSecondSave: ((result: OperationResult) => void) | undefined;
    let storeSubscriber:
      | ((
          current: [unknown, boolean, string, unknown, unknown],
          previous: [unknown, boolean, string, unknown, unknown]
        ) => void)
      | undefined;
    let triggerLocalEditOnNextGetId = false;

    subscribeMock.mockImplementation((_, listener) => {
      storeSubscriber = listener;
    });

    mockStore.getId.mockImplementation(() => {
      if (triggerLocalEditOnNextGetId && storeSubscriber) {
        triggerLocalEditOnNextGetId = false;
        storeSubscriber(
          [{ title: "edited" }, false, "Test form", undefined, undefined],
          [{ title: "initial" }, false, "Test form", undefined, undefined]
        );
      }

      return "form-1";
    });

    createOrUpdateTemplateMock
      .mockImplementationOnce(
        () =>
          new Promise<OperationResult>((resolve) => {
            resolveFirstSave = resolve;
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise<OperationResult>((resolve) => {
            resolveSecondSave = resolve;
          })
      );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SaveTemplateProvider>{children}</SaveTemplateProvider>
    );

    const { result } = renderHook(() => useTemplateContext(), { wrapper });

    let firstSavePromise!: Promise<{ status: string; formId?: string }>;
    let queuedSavePromise!: Promise<{ status: string; formId?: string }>;

    await act(async () => {
      firstSavePromise = result.current.saveDraft();
      queuedSavePromise = result.current.saveDraft();
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(1);

    triggerLocalEditOnNextGetId = true;

    await act(async () => {
      resolveFirstSave?.({
        formRecord: {
          id: "form-1",
          updatedAt: new Date().toISOString(),
        },
      });
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveSecondSave?.({
        formRecord: {
          id: "form-1",
          updatedAt: new Date().toISOString(),
        },
      });

      const [firstResult, queuedResult] = await Promise.all([firstSavePromise, queuedSavePromise]);

      expect(firstResult.status).toBe("saved");
      expect(queuedResult.status).toBe("saved");
    });

    expect(createOrUpdateTemplateMock).toHaveBeenCalledTimes(2);
  });

  it("autoflows automatic groups before saving", async () => {
    const pageId = "b34a213b-fa2e-4a9b-a255-6dc956b27558";
    const formConfig = {
      groups: {
        end: {
          name: "End",
          titleEn: "End",
          titleFr: "End",
          autoFlow: true,
          elements: [],
          nextAction: "start",
        },
        start: {
          name: "Start",
          titleEn: "Start",
          titleFr: "Start",
          autoFlow: true,
          elements: [],
          nextAction: "review",
        },
        review: {
          name: "Review",
          titleEn: "Review",
          titleFr: "Review",
          autoFlow: true,
          elements: [],
        },
        [pageId]: {
          name: "New page",
          titleEn: "",
          titleFr: "",
          autoFlow: true,
          elements: [],
          nextAction: "end",
        },
      },
      groupsLayout: [pageId],
    };
    mockStore.getSchema.mockReturnValue(JSON.stringify(formConfig));
    createOrUpdateTemplateMock.mockResolvedValue({
      formRecord: { id: "form-1", updatedAt: new Date().toISOString() },
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SaveTemplateProvider>{children}</SaveTemplateProvider>
    );

    const { result } = renderHook(() => useTemplateContext(), { wrapper });

    await act(async () => {
      await result.current.saveDraft();
    });

    const savedForm = createOrUpdateTemplateMock.mock.calls[0][0].formConfig;
    if (!savedForm.groups) {
      throw new Error("Expected saved form groups");
    }

    expect(savedForm.groups.start?.nextAction).toBe(pageId);
    expect(savedForm.groups[pageId]?.nextAction).toBe("review");
    expect(savedForm.groups.review?.nextAction).toBe("end");
    expect(savedForm.groups.end?.nextAction).toBeUndefined();
  });
});
