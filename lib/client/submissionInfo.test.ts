import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { storePendingSubmissionInfo, takePendingSubmissionInfo } from "./submissionInfo";

describe("pending submission info", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and consumes submission info for the matching form", () => {
    storePendingSubmissionInfo("form-1", "submission-1", "2026-11-12T12:00:00.000Z");

    expect(takePendingSubmissionInfo("form-2")).toBeNull();
    expect(takePendingSubmissionInfo("form-1")).toEqual({
      submissionId: "submission-1",
      submissionDate: "2026-11-12T12:00:00.000Z",
    });
    expect(takePendingSubmissionInfo("form-1")).toBeNull();
  });

  it("clears incomplete submission info", () => {
    storage.set("gcforms:pending-submission:form-1:id", "submission-1");

    expect(takePendingSubmissionInfo("form-1")).toBeNull();
    expect(storage.get("gcforms:pending-submission:form-1:id")).toBeUndefined();
  });
});
