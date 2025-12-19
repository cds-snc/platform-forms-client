import config from "../../config.json";
import axios from "axios";
import { gcFormsClientQueue } from "../common/operationQueues";

export async function publishForm(formId: string): Promise<void> {
  return gcFormsClientQueue(() =>
    axios
      .post<string>(
        config.gcFormsClient.url,
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
            cookie: config.gcFormsClient.authjsCookie,
            "next-action":
              config.gcFormsClient.serverActionIdentifiers.updateTemplatePublishedStatus,
          },
        }
      )
      .then((response) => {
        try {
          const match = response.data.match(/"formRecord"\s*:\s*\{"id"\s*:\s*"([^"]+)"/);

          if (match === null) {
            throw new Error("formRecord.id is not part of the response");
          }
        } catch (error) {
          throw new Error(
            `Failed to parse publish form server action response. This should indicate that the publish form operation did not succeed. Reason: ${
              (error as Error).message
            }`
          );
        }
      })
  );
}
