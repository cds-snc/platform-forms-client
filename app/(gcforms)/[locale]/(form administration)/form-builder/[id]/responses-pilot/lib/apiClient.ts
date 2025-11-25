import axios, { type AxiosInstance } from "axios";

import type {
  EncryptedFormSubmission,
  NewFormSubmission,
  FormSubmissionProblem,
  PrivateApiKey,
} from "./types";

import { TokenRateLimitError } from "./errorsTypes";
import { FormProperties } from "@root/lib/types";
import {
  addErrorSimulationInterceptor,
  addRateLimitTrackingInterceptor,
} from "./apiClientInterceptors";
import { getAccessTokenFromApiKey } from "./utils";

export class GCFormsApiClient {
  private formId: string;
  private httpClient: AxiosInstance;
  private cachedFormTemplate: FormProperties | null = null;
  private rateLimitRemaining: number | null = null;
  private privateApiKey: PrivateApiKey;
  private accessToken: string;
  private projectId: string;
  private tokenTimestamp: number;
  private readonly TOKEN_VALIDITY_MS = 1200000; // 20 minutes

  public constructor(
    formId: string,
    apiUrl: string,
    privateApiKey: PrivateApiKey,
    accessToken: string,
    projectId: string
  ) {
    this.formId = formId;
    this.privateApiKey = privateApiKey;
    this.accessToken = accessToken;
    this.projectId = projectId;
    this.tokenTimestamp = Date.now();

    // eslint-disable-next-line no-console
    console.log("GCFormsApiClient initialized for formId:", formId);
    // eslint-disable-next-line no-console
    console.log("Using projectId:", projectId);

    this.httpClient = axios.create({
      baseURL: apiUrl,
      timeout: 3000,
    });

    // Add request interceptor to refresh token and set auth header
    this.httpClient.interceptors.request.use(async (config) => {
      await this.ensureValidToken();
      config.headers.Authorization = `Bearer ${this.accessToken}`;
      return config;
    });

    // Add interceptors
    addRateLimitTrackingInterceptor(this.httpClient, (remaining) => {
      this.rateLimitRemaining = remaining;
    });
    addErrorSimulationInterceptor(this.httpClient);
  }

  private async ensureValidToken(): Promise<void> {
    const tokenAge = Date.now() - this.tokenTimestamp;

    if (tokenAge >= this.TOKEN_VALIDITY_MS) {
      this.accessToken = await getAccessTokenFromApiKey(this.privateApiKey, this.projectId);
      this.tokenTimestamp = Date.now();
    }
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

  public async getNewFormSubmissions(): Promise<NewFormSubmission[]> {
    await this.checkRateLimit();
    return this.httpClient
      .get<NewFormSubmission[]>(`/forms/${this.formId}/submission/new`)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new Error("Failed to retrieve new form submissions", {
          cause: error,
        });
      });
  }

  public async getFormSubmission(submissionName: string): Promise<EncryptedFormSubmission> {
    await this.checkRateLimit();
    return this.httpClient
      .get<EncryptedFormSubmission>(`/forms/${this.formId}/submission/${submissionName}`)
      .then((response) => response.data)
      .catch((error) => {
        if (error.response && error.response.status === 429) {
          throw new TokenRateLimitError("Rate limit exceeded. Please try again later.");
        } else {
          throw new Error("Failed to retrieve form submission", { cause: error });
        }
      });
  }

  public confirmFormSubmission(submissionName: string, confirmationCode: string): Promise<unknown> {
    return this.httpClient
      .put<unknown>(
        `/forms/${this.formId}/submission/${submissionName}/confirm/${confirmationCode}`,
        {}
      )
      .then((response) => response)
      .catch((error) => {
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
