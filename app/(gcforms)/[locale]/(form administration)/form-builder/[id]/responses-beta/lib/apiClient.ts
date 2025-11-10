import axios, { type AxiosInstance } from "axios";

import type { EncryptedFormSubmission, NewFormSubmission, FormSubmissionProblem } from "./types";

import { TokenRateLimitError } from "./errorsTypes";
import { FormProperties } from "@root/lib/types";
import {
  addErrorSimulationInterceptor,
  addRateLimitTrackingInterceptor,
} from "./apiClientInterceptors";

export class GCFormsApiClient {
  private formId: string;
  private httpClient: AxiosInstance;
  private cachedFormTemplate: FormProperties | null = null;
  private rateLimitRemaining: number | null = null;

  public constructor(formId: string, apiUrl: string, accessToken: string) {
    this.formId = formId;
    this.httpClient = axios.create({
      baseURL: apiUrl,
      timeout: 3000,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Add interceptors
    addRateLimitTrackingInterceptor(this.httpClient, (remaining) => {
      this.rateLimitRemaining = remaining;
    });
    addErrorSimulationInterceptor(this.httpClient);
  }

  private async checkRateLimit(): Promise<void> {
    // If we're getting low on requests (< 10% remaining), add a small delay
    if (this.rateLimitRemaining !== null && this.rateLimitRemaining < 30) {
      const delayMs = 5000; // 5 second delay when low
      // eslint-disable-next-line no-console
      console.log(`Rate limit low (${this.rateLimitRemaining} remaining), delaying ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  public getFormId(): string {
    return this.formId;
  }

  public getFormTemplate(): Promise<FormProperties> {
    // Return cached template if available
    if (this.cachedFormTemplate) {
      return Promise.resolve(this.cachedFormTemplate);
    }

    return this.httpClient
      .get<FormProperties>(`/forms/${this.formId}/template`)
      .then((response) => {
        // Cache the template for future calls
        this.cachedFormTemplate = response.data;
        return response.data;
      })
      .catch((error) => {
        throw new Error("Failed to retrieve form template", { cause: error });
      });
  }

  public async getNewFormSubmissions(signal?: AbortSignal): Promise<NewFormSubmission[]> {
    await this.checkRateLimit();
    return this.httpClient
      .get<NewFormSubmission[]>(`/forms/${this.formId}/submission/new`, { signal })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          throw new DOMException("Request aborted", "AbortError");
        }
        throw new Error("Failed to retrieve new form submissions", {
          cause: error,
        });
      });
  }

  public async getFormSubmission(
    submissionName: string,
    signal?: AbortSignal
  ): Promise<EncryptedFormSubmission> {
    await this.checkRateLimit();
    return this.httpClient
      .get<EncryptedFormSubmission>(`/forms/${this.formId}/submission/${submissionName}`, {
        signal,
      })
      .then((response) => response.data)
      .catch((error) => {
        if (axios.isCancel(error)) {
          throw new DOMException("Request aborted", "AbortError");
        }
        if (error.response && error.response.status === 429) {
          throw new TokenRateLimitError("Rate limit exceeded. Please try again later.");
        } else {
          throw new Error("Failed to retrieve form submission", { cause: error });
        }
      });
  }

  public confirmFormSubmission(
    submissionName: string,
    confirmationCode: string,
    signal?: AbortSignal
  ): Promise<unknown> {
    return this.httpClient
      .put<unknown>(
        `/forms/${this.formId}/submission/${submissionName}/confirm/${confirmationCode}`,
        {},
        { signal }
      )
      .then((response) => response)
      .catch((error) => {
        if (axios.isCancel(error)) {
          throw new DOMException("Request aborted", "AbortError");
        }
        throw new Error("Failed to confirm form submission", { cause: error });
      });
  }

  public reportProblemWithFormSubmission(
    submissionName: string,
    problem: FormSubmissionProblem
  ): Promise<void> {
    return this.httpClient
      .post<void>(`/forms/${this.formId}/submission/${submissionName}/problem`, problem, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then(() => Promise.resolve())
      .catch((error) => {
        throw new Error("Failed to report problem with form submission", {
          cause: error,
        });
      });
  }
}
