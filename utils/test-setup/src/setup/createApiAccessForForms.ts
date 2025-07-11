import config from "../../config.json";
import axios from "axios";

export async function createApiAccessForForms(
  formIds: string[]
): Promise<{ formId: string; apiKey: string }[]> {
  const createApiAccessForFormOperations = formIds.map((formId) =>
    createApiAccessForForm(formId).then((apiKey) => ({
      formId,
      apiKey,
    }))
  );

  const createApiAccessForFormOperationResults = await Promise.allSettled(
    createApiAccessForFormOperations
  );

  return createApiAccessForFormOperationResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

async function createApiAccessForForm(formId: string): Promise<string> {
  return axios
    .post<string>(config.targetEnvironment, [formId], {
      headers: {
        cookie: config.authjsCookie,
        "next-action": config.serverActionIdentifiers.createServiceAccountKey,
      },
    })
    .then((response) => {
      const lines = response.data.split("\n");

      const partialApiKeyResponse = lines.find((l) => l.startsWith("1:"));

      if (partialApiKeyResponse === undefined)
        throw new Error("Could not find partial API key in response");

      const partialApiKey: { type: string; keyId: string; userId: string; formId: string } =
        JSON.parse(partialApiKeyResponse.slice(partialApiKeyResponse.indexOf(":") + 1));

      const apiKeyMatch = response.data.match(
        /-----BEGIN PRIVATE KEY-----[\s\S]*?-----END PRIVATE KEY-----/
      );

      if (apiKeyMatch === null) throw new Error("Could not find API key in response");

      const apiKey = { ...partialApiKey, key: apiKeyMatch[0] };

      return JSON.stringify(apiKey);
    })
    .catch((error) => {
      console.error(error);
      throw new Error();
    });
}
