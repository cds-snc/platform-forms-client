import { afterEach, describe, expect, it, vi } from "vitest";
import { FormElementTypes, VaultStatus } from "@lib/types";
import {
  getMockSubmissionOverviews,
  getMockVaultSubmissions,
  mockResponseSubmissionsEnabled,
} from "./mockSubmissions";

describe("mock response submissions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is only enabled for local development with the explicit flag", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOCK_SUBMISSION_RESULTS", "true");

    expect(mockResponseSubmissionsEnabled()).toBe(true);

    vi.stubEnv("NODE_ENV", "production");

    expect(mockResponseSubmissionsEnabled()).toBe(false);
  });

  it("creates table rows for the selected status", () => {
    const submissions = getMockSubmissionOverviews("form-id", VaultStatus.DOWNLOADED);

    expect(submissions).toHaveLength(3);
    expect(submissions[0]).toMatchObject({
      formID: "form-id",
      name: "26-05-mock1",
      status: VaultStatus.DOWNLOADED,
    });
  });

  it("creates downloadable vault submissions from the form schema", () => {
    const submissions = getMockVaultSubmissions({
      formID: "form-id",
      ids: ["26-05-mock1"],
      form: {
        titleEn: "Mock form",
        titleFr: "Formulaire fictif",
        layout: [10],
        elements: [
          {
            id: 10,
            type: FormElementTypes.textField,
            properties: { titleEn: "Question", titleFr: "Question" },
          },
        ],
      },
    });

    expect(submissions).toHaveLength(1);
    expect(submissions[0].formSubmission).toEqual({
      "10": "Mock answer 1",
    });
  });
});
