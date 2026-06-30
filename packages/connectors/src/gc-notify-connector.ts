import { Agent } from "https";
import { getAwsSecret } from "./utils";
import axios, { AxiosError } from "axios";

export type EmailAttachment = {
  fileName: string;
  base64EncodedFile: string;
};

export type EmailContent = {
  templateId: string;
  placeholders: Record<string, string>;
  attachments?: EmailAttachment[];
};

const API_URL: string = "https://api.notification.canada.ca";

const httpsAgent = new Agent({ keepAlive: true });

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
    recipientAddress: string,
    content: EmailContent,
    referenceIdentifier?: string
  ): Promise<void> {
    try {
      await axios({
        httpsAgent: httpsAgent,
        url: `${this.apiUrl}/v2/notifications/email`,
        method: "POST",
        timeout: this.timeout,
        headers: {
          "Content-Type": "application/json",
          Authorization: `ApiKey-v1 ${this.apiKey}`,
        },
        data: {
          email_address: recipientAddress,
          template_id: content.templateId,
          personalisation: {
            ...content.placeholders,
            ...(content.attachments
              ? Object.fromEntries(
                  content.attachments.map((f, i) => [
                    `file${i}`,
                    {
                      file: f.base64EncodedFile,
                      filename: f.fileName,
                      sending_method: "attach",
                    },
                  ])
                )
              : {}),
          },
          ...(referenceIdentifier && { reference: referenceIdentifier }),
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

          if (error.code === AxiosError.ECONNABORTED) {
            errorMessage = `Request timed out`;
          } else {
            errorMessage = `Error code: ${error.code ?? "n/a"} / Error stack: ${
              error.stack ?? "n/a"
            }`;
          }
        }
      } else if (error instanceof Error) {
        errorMessage = `${(error as Error).message}`;
      }

      throw new Error(errorMessage);
    }
  }
}
