import { requestUserInput } from "./common/utils.js";
import { SingleBar } from "cli-progress";
import axios from "axios";
import { createResponses } from "./setup/createResponse.js";
import { styleText } from "node:util";
import { setUpFileAttachments } from "./setup/setUpFileAttachments.js";
import { cleanUpFileAttachments } from "./cleanup/cleanUpFileAttachments.js";

async function main(): Promise<void> {
  const progress = new SingleBar({
    format: "[{bar}] | {step} ({value} / {total})",
    barIncompleteChar: " ",
    barCompleteChar: "=",
    clearOnComplete: true,
  });

  try {
    const formId = await requestUserInput("Form ID to generate responses for: ");
    const numberOfResponses = Number(await requestUserInput("Number of responses to generate: "));
    const appEnv = await requestUserInput("App Environment:  [0] Local || [1] Staging: ").then(
      (env) => (env === "1" ? "https://forms-staging.cdssandbox.xyz" : "http://localhost:3000")
    );

    console.info(`Retrieving form template from ${appEnv}`);

    const formTemplate = await axios.get(`${appEnv}/api/templates/${formId}`).then(({ data }) => {
      return data.form;
    });

    console.info("\n");
    console.info(formTemplate);
    console.info("\n");

    if (!formTemplate) {
      throw new Error("Failed to retrieve form template");
    }

    console.info("Setting up file attachment pool...");

    const fileAttachmentPool = await setUpFileAttachments();

    progress.start(numberOfResponses, 0, {
      step: "Generating responses",
    });

    let totalNumberOfSuccessfullyCreatedResponses = 0;
    let totalNumberOfFailedInsertOperations = 0;

    for await (const createResponsesProgress of createResponses(
      { id: formId, template: formTemplate },
      numberOfResponses,
      fileAttachmentPool
    )) {
      progress.increment(createResponsesProgress.numberOfSuccessfullyCreatedResponses);

      totalNumberOfSuccessfullyCreatedResponses =
        totalNumberOfSuccessfullyCreatedResponses +
        createResponsesProgress.numberOfSuccessfullyCreatedResponses;
      totalNumberOfFailedInsertOperations =
        totalNumberOfFailedInsertOperations +
        createResponsesProgress.numberOfFailedInsertOperations;
    }

    progress.stop();

    console.info("Cleaning up file attachment pool...");

    await cleanUpFileAttachments(fileAttachmentPool.map((f) => f.path));

    console.info(
      styleText(
        "greenBright",
        `A total of ${totalNumberOfSuccessfullyCreatedResponses} responses have been generated.`
      )
    );

    if (totalNumberOfFailedInsertOperations > 0) {
      console.info(
        styleText(
          "redBright",
          `\n${totalNumberOfFailedInsertOperations} insert response operations that failed.`
        )
      );
    }
  } catch (error) {
    progress.stop();

    console.error(
      styleText("redBright", `Oops! Something wrong happened. Reason: ${(error as Error).message}`)
    );
  }
}

main();
