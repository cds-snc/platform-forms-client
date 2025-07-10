import config from "../config.json";
import readline from "node:readline";
import { createRandomForms } from "./setup/createForm.js";
import { writeFile } from "node:fs/promises";
import { publishForms } from "./setup/publishForm.js";
import { createApiAccessForForms } from "./setup/createApiAccessForForms";

async function main(): Promise<void> {
  try {
    const numberOfFormsToCreate = Number(await requestUserInput("Number of forms to create: "));

    const shouldPublishForms = Boolean(
      await requestUserInput("Do you want the forms to be published? (yes or no): ").then(
        (response) => (response === "yes" ? true : false)
      )
    );

    const shouldEnableApiAccessForForm = Boolean(
      await requestUserInput(
        "Do you want to enable API access for those forms? (yes or no): "
      ).then((response) => (response === "yes" ? true : false))
    );

    const createdForms = await createRandomForms(numberOfFormsToCreate, config.formTemplates);

    await saveCreatedForms(createdForms);

    console.info(
      `${
        createdForms.length === numberOfFormsToCreate
          ? `All ${createdForms.length}`
          : `${createdForms.length} out of ${numberOfFormsToCreate}`
      } forms have been created!`
    );

    if (shouldPublishForms) {
      const publishedForms = await publishForms(createdForms);

      console.info(
        `${
          publishedForms.length === createdForms.length
            ? `All ${publishedForms.length}`
            : `${publishedForms.length} out of ${createdForms} created`
        } forms have been published!`
      );
    }

    if (shouldEnableApiAccessForForm) {
      const apiAccessibleForms = await createApiAccessForForms(createdForms);

      console.info(
        `${
          apiAccessibleForms.length === createdForms.length
            ? `All ${apiAccessibleForms.length}`
            : `${apiAccessibleForms.length} out of ${createdForms} created`
        } forms are now accessible via API!`
      );

      await saveCreatedFormsWithAssociatedApiKeys(createdForms, apiAccessibleForms);
    }

    console.info("You are done! The 'output.json' file has been generated.");
  } catch (error) {
    console.error(error);

    console.info(
      "Oops! Something wrong happened. A partial 'output.json' file has been generated."
    );
  }
}

function requestUserInput(question: string): Promise<string> {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    readlineInterface.question(question, (response) => {
      readlineInterface.close();
      resolve(response);
    })
  );
}

async function saveCreatedForms(createdFormIds: string[]): Promise<void> {
  return saveOutput({
    testForms: createdFormIds.map((id) => ({ id })),
  });
}

async function saveCreatedFormsWithAssociatedApiKeys(
  createdFormIds: string[],
  formIdWithApiKey: { formId: string; apiKey: string }[]
): Promise<void> {
  const testForms = createdFormIds.map((id) => {
    const apiPrivateKey = formIdWithApiKey.find((i) => i.formId === id)?.apiKey ?? "";
    return { id, apiPrivateKey };
  });

  return saveOutput({ testForms });
}

async function saveOutput(output: Record<string, any>): Promise<void> {
  return writeFile("output.json", JSON.stringify(output));
}

main();
