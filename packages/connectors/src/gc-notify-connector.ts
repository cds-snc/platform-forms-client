import { getAwsSecret } from "./getAwsSecret";
import axios from "axios";

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
      await axios({
        url: `${this.apiUrl}/v2/notifications/email`,
        method: "POST",
        timeout: this.timeout,
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey-v1 ${this.apiKey}`,
        },
        data: {
          email_address: emailAddress,
          template_id: templateId,
          personalisation,
          ...(reference && { reference }),
        },
      });
    } catch (error) {
      let errorMessage = "";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          /*
           * The request was made and the server responded with a
           * status code that falls out of the range of 2xx
           */
          const notifyErrors = Array.isArray(error.response.data.errors)
            ? JSON.stringify(error.response.data.errors)
            : error.response.data.errors;
          errorMessage = `GC Notify errored with status code ${error.response.status} and returned the following detailed errors ${notifyErrors}`;
        } else if (error.request) {
          /*
           * The request was made but no response was received, `error.request`
           * is an instance of XMLHttpRequest in the browser and an instance
           * of http.ClientRequest in Node.js
           */
          errorMessage = `Request timed out`;
        }
      } else if (error instanceof Error) {
        errorMessage = `${(error as Error).message}`;
      }

      throw new Error(errorMessage);
    }
  }
}
