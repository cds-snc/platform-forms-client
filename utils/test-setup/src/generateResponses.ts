import { requestUserInput } from "./common/utils.js";
import { SingleBar } from "cli-progress";
import axios from "axios";
import { createResponses } from "./setup/createResponse.js";
import { styleText } from "node:util";

async function main(): Promise<void> {
  const progress = new SingleBar({
    format: "[{bar}] | {step} ({value} / {total})",
    fps: 60,
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

    progress.start(numberOfResponses, 0, {
      step: "Generating responses",
    });

    let numberOfSuccessfulResponses = 0;
    let numberOfFailedResponses = 0;

    for await (const createResponsesProgress of createResponses(
      { id: formId, template: formTemplate },
      numberOfResponses
    )) {
      progress.increment(createResponsesProgress.numberOfSuccessfulResponses);

      numberOfSuccessfulResponses =
        numberOfSuccessfulResponses + createResponsesProgress.numberOfSuccessfulResponses;
      numberOfFailedResponses =
        numberOfFailedResponses + createResponsesProgress.numberOfFailedResponses;
    }

    progress.stop();

    console.info(
      styleText(
        ["greenBright"],
        `A total of ${numberOfSuccessfulResponses} submissions have been generated.`
      )
    );

    if (numberOfFailedResponses > 0) {
      console.info(
        styleText(["redBright"], `\n${numberOfFailedResponses} submissions failed to be generated.`)
      );
    }
  } catch (error) {
    progress.stop();

    console.error(
      styleText(
        ["redBright"],
        `Oops! Something wrong happened. Reason: ${(error as Error).message}`
      )
    );
  }
}

main();
