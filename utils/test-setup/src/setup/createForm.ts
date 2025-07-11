import config from "../../config.json";
import axios from "axios";

export async function createRandomForms(
  numberOfForms: number,
  templates: string[]
): Promise<string[]> {
  const createFormOperations = Array.from({ length: numberOfForms }).map((_, i) => {
    const randomTemplate: Record<string, any> = JSON.parse(
      templates[Math.floor(Math.random() * templates.length)]
    );

    return createForm(`Test form - ${i}`, randomTemplate);
  });

  const createFormOperationResults = await Promise.allSettled(createFormOperations);

  return createFormOperationResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

async function createForm(name: string, template: Record<string, any>): Promise<string> {
  return axios
    .post<string>(
      config.targetEnvironment,
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
          cookie: config.authjsCookie,
          "next-action": config.serverActionIdentifiers.createOrUpdateTemplate,
        },
      }
    )
    .then((response) => {
      const lines = response.data.split("\n");
      const jsonResponse: { formRecord: { id: string } } = JSON.parse(
        lines[1].slice(lines[1].indexOf(":") + 1)
      );
      return jsonResponse.formRecord.id;
    })
    .catch((error) => {
      console.error(error);
      throw new Error();
    });
}
