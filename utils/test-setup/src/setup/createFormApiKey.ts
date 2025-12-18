import config from "../../config.json";
import axios from "axios";
import { gcFormsClientQueue } from "../common/operationQueues";

export async function createFormApiKey(formId: string): Promise<string> {
  return gcFormsClientQueue(() =>
    axios
      .post<string>(config.gcFormsClient.url, [formId], {
        headers: {
          cookie: config.gcFormsClient.authjsCookie,
          "next-action": config.gcFormsClient.serverActionIdentifiers.createServiceAccountKey,
        },
      })
      .then((response) => {
        try {
          const apiKeyMetadataMatch = response.data.match(
            /\{"type":"serviceAccount","keyId":"\d+","key":"[^"]+","userId":"\d+","formId":"[a-z0-9]+"\}/
          );

          const apiKeyMatch = response.data.match(
            /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/
          );

          if (apiKeyMetadataMatch === null || apiKeyMatch === null)
            throw new Error("Could not parse response");

          const partialApiKey: { type: string; keyId: string; userId: string; formId: string } =
            JSON.parse(apiKeyMetadataMatch[0]);

          const apiKey = { ...partialApiKey, key: apiKeyMatch[0] };

          return JSON.stringify(apiKey);
        } catch (error) {
          throw new Error(
            `Failed to parse create API key server action response. This should indicate that the create API key operation did not succeed. Reason: ${
              (error as Error).message
            }`
          );
        }
      })
  );
}
