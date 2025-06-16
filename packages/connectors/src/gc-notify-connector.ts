import { getAwsSecret } from "./getAwsSecret";
import got, { HTTPError, RequestError, TimeoutError } from "got";

const API_URL: string = "https://api.notification.canada.ca";

export type Personalisation = Record<string, string | boolean | Record<string, string | boolean>>;

export class GCNotifyConnector {
  private apiUrl: string;
  private apiKey: string;
  private timeout: number;

  public static defaultUsingApiKeyFromAwsSecret(
    apiKeySecretIdentifier: string,
    timeout: number = 5000
  ): Promise<GCNotifyConnector> {
    return getAwsSecret(apiKeySecretIdentifier).then((apiKey) => {
      if (apiKey === undefined) {
        throw new Error("GC Notify API key is undefined");
      }

      return new GCNotifyConnector(API_URL, apiKey, timeout);
    });
  }

  public static default(apiKey: string, timeout: number = 5000): GCNotifyConnector {
    return new GCNotifyConnector(API_URL, apiKey, timeout);
  }

  private constructor(apiUrl: string, apiKey: string, timeout: number) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  public async sendEmail(
    emailAddress: string,
    templateId: string,
    personalisation: Personalisation,
    reference?: string
  ): Promise<void> {
    try {
      await got.post(`${this.apiUrl}/v2/notifications/email`, {
        timeout: { request: this.timeout },
        retry: { limit: 0 },
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey-v1 ${this.apiKey}`,
        },
        json: {
          email_address: emailAddress,
          template_id: templateId,
          personalisation,
          ...(reference && { reference }),
        },
      });
    } catch (error) {
      let errorMessage = "";

      if (error instanceof HTTPError) {
        try {
          // Here is an example of an error being returned by GC Notify:
          // body: '{"status_code": 400, "errors": [{"error": "ValidationError", "message": "email_address 10 is not of type string"}]}',

          const gcNotifyError: {
            status_code: number;
            errors: { error: string; message: string }[];
          } = JSON.parse(error.response.body as string);

          errorMessage = `GC Notify errored with status code ${
            gcNotifyError.status_code
          } and returned the following detailed errors ${JSON.stringify(gcNotifyError.errors)}`;
        } catch (parseError) {
          errorMessage = `GC Notify errored with a message we could not parse due to ${
            (parseError as Error).message
          }. Error => Code: ${(error as RequestError).code} / Message: ${
            (error as RequestError).message
          }`;
        }
      } else if (error instanceof TimeoutError) {
        errorMessage = `Request timed out`;
      } else {
        errorMessage = `Error => Code: ${(error as RequestError).code} / Message: ${
          (error as RequestError).message
        }`;
      }

      throw new Error(errorMessage);
    }
  }
}
