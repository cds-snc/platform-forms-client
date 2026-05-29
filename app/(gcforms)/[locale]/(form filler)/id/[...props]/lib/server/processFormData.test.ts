import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { processFormData } from "./processFormData";
import { getPublicTemplateByID } from "@lib/templates";
import { invokeSubmissionLambda } from "./invokeSubmissionLambda";
import { validatePayloadSize } from "@lib/validation/validatePayloadSize";

vi.mock("@lib/templates", () => ({
  getPublicTemplateByID: vi.fn(),
}));

vi.mock("./invokeSubmissionLambda", () => ({
  invokeSubmissionLambda: vi.fn(),
}));

vi.mock("@lib/validation/validatePayloadSize", () => ({
  validatePayloadSize: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    info: vi.fn(),
  },
}));

describe("processFormData", () => {
  const formId = "form-id";
  const form = {
    id: formId,
    closingDate: undefined,
    templateVersionId: "version-id",
  };
  const responses = { question: "answer" };

  beforeEach(() => {
    vi.clearAllMocks();
    (getPublicTemplateByID as Mock).mockResolvedValue(form);
    (validatePayloadSize as Mock).mockReturnValue(true);
    (invokeSubmissionLambda as Mock).mockResolvedValue({ submissionId: "lambda-submission" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a mock submission result in local development when enabled", async () => {
    vi.stubEnv("APP_ENV", "development");
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("MOCK_SUBMISSION_RESULTS", "true");

    const result = await processFormData({ responses, formId });

    expect(result.submissionId).toMatch(/^mock-submission-form-id-/);
    expect(invokeSubmissionLambda).not.toHaveBeenCalled();
  });

  it("uses the submission lambda when mock results are enabled outside local development", async () => {
    vi.stubEnv("APP_ENV", "production");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("MOCK_SUBMISSION_RESULTS", "true");

    const result = await processFormData({ responses, formId });

    expect(result).toEqual({ submissionId: "lambda-submission" });
    expect(invokeSubmissionLambda).toHaveBeenCalled();
  });
});
