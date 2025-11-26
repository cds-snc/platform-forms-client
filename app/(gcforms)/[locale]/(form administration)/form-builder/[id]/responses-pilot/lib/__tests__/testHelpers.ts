import crypto from "crypto";
import { vi } from "vitest";
import submissionFixture from "./fixtures/response-get-support.json";
import templateFixture from "./fixtures/template-get-support-cmeaj61dl0001xf01aja6mnpf.json";
import InMemoryDirectoryHandle from "./fsMock";
import type { GCFormsApiClient } from "../apiClient";
import type { EncryptedFormSubmission } from "../types";
import type { FormProperties } from "@root/lib/types";
import type { ResponseDownloadLogger } from "../logger";
import { ResponseDownloadLogger as ResponseDownloadLoggerClass } from "../logger";

export const setupInMemoryEnv = () => {
  const dir = new InMemoryDirectoryHandle();
  const formTemplate = templateFixture as unknown;
  const expectedChecksum = crypto.createHash("md5").update(submissionFixture.answers).digest("hex");

  const mockApiClient: Partial<GCFormsApiClient> = {
    getFormSubmission: async (submissionName: string) =>
      ({
        encryptedResponses: "encrypted-data",
        encryptedKey: "key",
        encryptedNonce: "nonce",
        encryptedAuthTag: "tag",
        name: submissionName,
        confirmationCode: submissionFixture.confirmationCode,
      }) as unknown as EncryptedFormSubmission,
    confirmFormSubmission: async () => {},
    getFormTemplate: async () => formTemplate as unknown as FormProperties,
    getFormId: () => "test-form",
    getNewFormSubmissions: async () => [],
  };

  return { dir, formTemplate, expectedChecksum, mockApiClient };
};

export default setupInMemoryEnv;

export const testLogger: ResponseDownloadLogger = new ResponseDownloadLoggerClass();

// Compute checksum at module scope for mocks
const moduleExpectedChecksum = crypto
  .createHash("md5")
  .update(submissionFixture.answers)
  .digest("hex");

export const setupMocks = () => {
  vi.mock("../utils", () => ({
    decryptFormSubmission: async () => JSON.stringify(submissionFixture),
  }));

  vi.mock("hash-wasm", () => ({
    md5: async () => moduleExpectedChecksum,
  }));
};

export { moduleExpectedChecksum };

export const prepareTestEnv = () => {
  setupMocks();
  const env = setupInMemoryEnv();
  return { ...env, logger: testLogger };
};

export type PreparedTestEnv = ReturnType<typeof prepareTestEnv>;

// Default typed stubs for tests
export const defaultSetProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>> =
  (() => {}) as unknown as React.Dispatch<React.SetStateAction<Set<string>>>;

export const defaultT: import("i18next").TFunction = ((k: string) =>
  k) as unknown as import("i18next").TFunction;
