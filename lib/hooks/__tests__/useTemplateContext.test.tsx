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

type OperationResult = {
  formRecord: {
    id: string;
    updatedAt: string;
  } | null;
  error?: string;
};

const { createOrUpdateTemplateMock, mockStore, subscribeMock } = vi.hoisted(() => ({
  createOrUpdateTemplateMock: vi.fn<() => Promise<OperationResult>>(),
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
});
