import crypto from "crypto";
import { vi } from "vitest";
import type React from "react";
import submissionFixture from "./fixtures/response-get-support.json";
import templateFixture from "./fixtures/template-get-support-cmeaj61dl0001xf01aja6mnpf.json";
import InMemoryDirectoryHandle from "./fsMock";
import type { GCFormsApiClient } from "../apiClient";
import type { EncryptedFormSubmission } from "../types";
import type { FormProperties } from "@root/lib/types";
import type { ResponseDownloadLogger } from "../logger";
import { ResponseDownloadLogger as ResponseDownloadLoggerClass } from "../logger";

let currentMockSubmission: SubmissionFixture | null = null;
let currentComputedChecksum: string | null = null;

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
  // Ensure module-level holders are set so mock factories that reference them work
  currentMockSubmission = submissionFixture as SubmissionFixture;
  currentComputedChecksum = moduleExpectedChecksum;

  vi.mock("../utils", () => ({
    decryptFormSubmission: async () => JSON.stringify(currentMockSubmission),
  }));

  vi.mock("hash-wasm", () => ({
    md5: async () => currentComputedChecksum,
  }));
};

export { moduleExpectedChecksum };

export const prepareTestEnv = () => {
  setupMocks();
  const env = setupInMemoryEnv();
  return { ...env, logger: testLogger };
};

// Prepare an environment using specific fixtures (for tests that need different fixtures)
type SubmissionFixture = {
  answers: string;
  confirmationCode?: string;
};

export const setupInMemoryEnvFromFixtures = (submission: SubmissionFixture, template: unknown) => {
  const dir = new InMemoryDirectoryHandle();
  const formTemplate = template as unknown;
  const expectedChecksum = crypto.createHash("md5").update(submission.answers).digest("hex");

  const mockApiClient: Partial<GCFormsApiClient> = {
    getFormSubmission: async (submissionName: string) =>
      ({
        encryptedResponses: "encrypted-data",
        encryptedKey: "key",
        encryptedNonce: "nonce",
        encryptedAuthTag: "tag",
        name: submissionName,
        confirmationCode: submission.confirmationCode,
      }) as unknown as EncryptedFormSubmission,
    confirmFormSubmission: async () => {},
    getFormTemplate: async () => formTemplate as unknown as FormProperties,
    getFormId: () => "test-form",
    getNewFormSubmissions: async () => [],
  };

  return { dir, formTemplate, expectedChecksum, mockApiClient };
};

export const prepareTestEnvFromFixtures = (submission: SubmissionFixture, template: unknown) => {
  // Use module-level holder so the mock factory can reference it reliably
  currentMockSubmission = submission;
  // Mock utils and checksum to return values based on provided fixtures
  vi.mock("../utils", () => ({
    decryptFormSubmission: async () => JSON.stringify(currentMockSubmission),
  }));
  currentComputedChecksum = crypto
    .createHash("md5")
    .update(currentMockSubmission!.answers)
    .digest("hex");
  vi.mock("hash-wasm", () => ({
    md5: async () => currentComputedChecksum,
  }));

  const env = setupInMemoryEnvFromFixtures(submission, template);
  return { ...env, logger: testLogger };
};

export type PreparedTestEnv = ReturnType<typeof prepareTestEnv>;

// Default typed stubs for tests
export const defaultSetProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>> =
  (() => {}) as unknown as React.Dispatch<React.SetStateAction<Set<string>>>;

export const defaultT: import("i18next").TFunction = ((k: string) =>
  k) as unknown as import("i18next").TFunction;
