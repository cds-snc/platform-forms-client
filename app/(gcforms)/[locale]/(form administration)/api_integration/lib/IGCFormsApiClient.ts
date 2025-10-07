import type { EncryptedFormSubmission, NewFormSubmission, FormSubmissionProblem } from "./types";

/**
 * Common interface for both real and mock API clients
 */
export interface IGCFormsApiClient {
  getFormTemplate(): Promise<Record<string, unknown>>;
  getNewFormSubmissions(): Promise<NewFormSubmission[]>;
  getFormSubmission(submissionName: string): Promise<EncryptedFormSubmission>;
  confirmFormSubmission(submissionName: string, confirmationCode: string): Promise<void>;
  reportProblemWithFormSubmission(
    submissionName: string,
    problem: FormSubmissionProblem
  ): Promise<void>;
}
