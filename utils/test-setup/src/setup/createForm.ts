import config from "../../config.json";
import axios from "axios";
import { gcFormsClientQueue } from "../common/operationQueues";

export async function createForm(name: string, template: Record<string, any>): Promise<string> {
  return gcFormsClientQueue(() =>
    axios
      .post<string>(
        config.gcFormsClient.url,
        [
          {
            id: "",
            formConfig: template,
            name: name,
            deliveryOption: "$undefined",
            securityAttribute: "Protected A",
            notificationsInterval: 1440,
          },
        ],
        {
          headers: {
            cookie: config.gcFormsClient.authjsCookie,
            "next-action": config.gcFormsClient.serverActionIdentifiers.createOrUpdateTemplate,
          },
        }
      )
      .then((response) => {
        try {
          const responseMatch = response.data.match(/\{"formRecord":\{.*?\}\}/);

          if (responseMatch === null) throw new Error("Could not parse response");

          const jsonResponse = JSON.parse(responseMatch[0]);

          if (jsonResponse.formRecord === null) {
            throw new Error("formRecord is null");
          }

          return jsonResponse.formRecord.id;
        } catch (error) {
          throw new Error(
            `Failed to parse create form server action response. This should indicate that the create form operation did not succeed. Reason: ${
              (error as Error).message
            }`
          );
        }
      })
  );
}
