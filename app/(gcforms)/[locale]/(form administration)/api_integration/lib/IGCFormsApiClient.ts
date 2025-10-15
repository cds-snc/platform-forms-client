import { type FormProperties } from "@gcforms/types";
import type { EncryptedFormSubmission, NewFormSubmission, FormSubmissionProblem } from "./types";

/**
 * Common interface for both real and mock API clients
 */
export interface IGCFormsApiClient {
  getFormId(): string;
  getFormTemplate(): Promise<FormProperties>;
  getNewFormSubmissions(): Promise<NewFormSubmission[]>;
  getFormSubmission(submissionName: string): Promise<EncryptedFormSubmission>;
  confirmFormSubmission(submissionName: string, confirmationCode: string): Promise<void>;
  reportProblemWithFormSubmission(
    submissionName: string,
    problem: FormSubmissionProblem
  ): Promise<void>;
}
