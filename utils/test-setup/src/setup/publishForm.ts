import config from "../../config.json";
import axios from "axios";

export async function publishForms(formIds: string[]): Promise<string[]> {
  const publishFormOperations = formIds.map((formId) => publishForm(formId).then((_) => formId));

  const publishFormOperationResults = await Promise.allSettled(publishFormOperations);

  return publishFormOperationResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

async function publishForm(formId: string): Promise<void> {
  return axios.post(
    config.targetEnvironment,
    [
      {
        id: formId,
        isPublished: true,
        publishFormType: "test-setup-tool",
        publishDescription: "test-setup-tool",
        publishReason: "test-setup-tool",
      },
    ],
    {
      headers: {
        cookie: config.authjsCookie,
        "next-action": config.serverActionIdentifiers.updateTemplatePublishedStatus,
      },
    }
  );
}
