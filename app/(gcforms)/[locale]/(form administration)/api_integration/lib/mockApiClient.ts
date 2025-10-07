import type { EncryptedFormSubmission, NewFormSubmission, FormSubmissionProblem } from "./types";

/**
 * Mock API client for development and testing
 * Simulates the GCFormsApiClient behavior without making real API calls
 */
export class MockGCFormsApiClient {
  private formId: string;

  public constructor(formId: string, _apiUrl: string, _accessToken: string) {
    this.formId = formId;
    // eslint-disable-next-line no-console
    console.log(`Mock API Client initialized for form: ${formId}`);
  }

  public async getFormTemplate(): Promise<Record<string, unknown>> {
    // Simulate API delay
    await this.delay(500);

    return {
      id: this.formId,
      titleEn: "Sample Form",
      titleFr: "Formulaire d'exemple",
      descriptionEn: "A sample form for testing",
      descriptionFr: "Un formulaire d'exemple pour les tests",
      elements: [
        {
          id: "field1",
          type: "textField",
          properties: {
            titleEn: "Your Name",
            titleFr: "Votre nom",
          },
        },
      ],
    };
  }

  public async getNewFormSubmissions(): Promise<NewFormSubmission[]> {
    // Simulate API delay
    await this.delay(800);

    const mockSubmissions: NewFormSubmission[] = [
      {
        name: "submission-2025-001",
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        name: "submission-2025-002",
        createdAt: new Date(Date.now() - 43200000), // 12 hours ago
      },
      {
        name: "submission-2025-003",
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        name: "submission-2025-004",
        createdAt: new Date(), // Just now
      },
    ];

    return mockSubmissions;
  }

  public async getFormSubmission(submissionName: string): Promise<EncryptedFormSubmission> {
    // Simulate API delay
    await this.delay(600);

    // Simulate rate limiting occasionally
    if (Math.random() < 0.1) {
      // 10% chance
      const error = new Error("Rate limit exceeded") as Error & { response: { status: number } };
      error.response = { status: 429 };
      throw error;
    }

    return {
      name: submissionName,
      encryptedKey: "mock-encrypted-key-base64",
      encryptedNonce: "mock-encrypted-nonce-base64",
      encryptedAuthTag: "mock-encrypted-auth-tag-base64",
      encryptedResponses: "mock-encrypted-responses-base64",
      confirmationCode: `confirm-${submissionName}-${Date.now()}`,
    };
  }

  public async confirmFormSubmission(
    submissionName: string,
    confirmationCode: string
  ): Promise<void> {
    // Simulate API delay
    await this.delay(400);

    // eslint-disable-next-line no-console
    console.log(`Mock: Confirmed submission ${submissionName} with code ${confirmationCode}`);

    // Simulate occasional failures
    if (Math.random() < 0.05) {
      // 5% chance
      throw new Error("Failed to confirm submission - mock error");
    }
  }

  public async reportProblemWithFormSubmission(
    submissionName: string,
    problem: FormSubmissionProblem
  ): Promise<void> {
    // Simulate API delay
    await this.delay(300);

    // eslint-disable-next-line no-console
    console.log(`Mock: Reported problem for ${submissionName}:`, problem);
  }

  /**
   * Simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
