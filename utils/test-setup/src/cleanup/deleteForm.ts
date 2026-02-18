import config from "../../config.json";
import axios from "axios";
import { gcFormsClientQueue } from "../common/operationQueues";

export async function deleteForm(formId: string): Promise<void> {
  return gcFormsClientQueue(() =>
    axios
      .post<string>(config.gcFormsClient.url, [formId], {
        headers: {
          cookie: config.gcFormsClient.authjsCookie,
          "next-action": config.gcFormsClient.serverActionIdentifiers.deleteForm,
        },
      })
      .then((response) => {
        try {
          if (/Failed to Delete Form/i.test(response.data)) {
            throw new Error("Failed to delete form");
          }
        } catch (error) {
          throw new Error(
            `Failed to parse delete form server action response. This should indicate that the delete form operation did not succeed. Reason: ${
              (error as Error).message
            }`
          );
        }
      })
  );
}
