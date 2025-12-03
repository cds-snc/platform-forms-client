import crypto from "crypto";
import { vi } from "vitest";
import type React from "react";
import InMemoryDirectoryHandle from "./fsMock";
import type { GCFormsApiClient } from "../apiClient";
import type { EncryptedFormSubmission } from "../types";
import type { FormProperties } from "@root/lib/types";
import type { ResponseDownloadLogger } from "../logger";
import { ResponseDownloadLogger as ResponseDownloadLoggerClass } from "../logger";

export const testLogger: ResponseDownloadLogger = new ResponseDownloadLoggerClass();

// Prepare an environment using specific fixtures
export type SubmissionFixture = {
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
  // Serialize fixture values before registering mocks to avoid closure issues
  const serializedSubmission = JSON.stringify(submission);
  const currentComputedChecksum = crypto.createHash("md5").update(submission.answers).digest("hex");

  // Mock utils and checksum to return values based on provided fixtures
  // Use runtime mocks (doMock) so the factory runs after serialized values are computed
  // Reset module registry so previous mocks don't leak between tests
  vi.resetModules();

  vi.doMock("../utils", () => ({
    decryptFormSubmission: async () => serializedSubmission,
  }));

  vi.doMock("hash-wasm", () => ({
    md5: async () => currentComputedChecksum,
  }));

  // Mock global fetch for attachment downloads (AWS S3 URLs expire quickly in fixtures)
  global.fetch = vi.fn(async (_url: string | URL | Request) => {
    // Return mock attachment content for any fetch call
    return {
      ok: true,
      status: 200,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("mock attachment content"));
          controller.close();
        },
      }),
    } as Response;
  });

  const env = setupInMemoryEnvFromFixtures(submission, template);
  return { ...env, logger: testLogger };
};

export type PreparedTestEnv = ReturnType<typeof prepareTestEnvFromFixtures>;

// Default typed stubs for tests
export const defaultSetProcessedSubmissionIds: React.Dispatch<React.SetStateAction<Set<string>>> =
  (() => {}) as unknown as React.Dispatch<React.SetStateAction<Set<string>>>;

export const defaultT: import("i18next").TFunction = ((k: string) =>
  k) as unknown as import("i18next").TFunction;
