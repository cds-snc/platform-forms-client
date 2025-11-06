import { type FormProperties } from "@gcforms/types";
import type { EncryptedFormSubmission, NewFormSubmission, FormSubmissionProblem } from "./types";

/**
 * Common interface for both real and mock API clients
 */
export interface IGCFormsApiClient {
  getFormId(): string;
  getFormTemplate(signal?: AbortSignal): Promise<FormProperties>;
  getNewFormSubmissions(signal?: AbortSignal): Promise<NewFormSubmission[]>;
  getFormSubmission(submissionName: string, signal?: AbortSignal): Promise<EncryptedFormSubmission>;
  confirmFormSubmission(
    submissionName: string,
    confirmationCode: string,
    signal?: AbortSignal
  ): Promise<unknown>;
  reportProblemWithFormSubmission(
    submissionName: string,
    problem: FormSubmissionProblem
  ): Promise<void>;
}
