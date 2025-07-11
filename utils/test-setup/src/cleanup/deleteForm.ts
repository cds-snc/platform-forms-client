import config from "../../config.json";
import axios from "axios";

export async function deleteForms(formIds: string[]): Promise<string[]> {
  const deleteFormOperations = formIds.map((formId) => deleteForm(formId).then((_) => formId));

  const deleteFormOperationResults = await Promise.allSettled(deleteFormOperations);

  return deleteFormOperationResults
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
}

async function deleteForm(formId: string): Promise<void> {
  return axios
    .post(config.targetEnvironment, [formId], {
      headers: {
        cookie: config.authjsCookie,
        "next-action": config.serverActionIdentifiers.deleteForm,
      },
    })
    .then((_) => {})
    .catch((error) => {
      console.error(error);
      throw new Error();
    });
}
