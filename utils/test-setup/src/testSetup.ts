import config from "../config.json";
import { createForm } from "./setup/createForm.js";
import { publishForm } from "./setup/publishForm.js";
import { createFormApiKey } from "./setup/createFormApiKey";
import { MultiBar } from "cli-progress";
import { createResponses } from "./setup/createResponse";
import { readFile, writeFile } from "node:fs/promises";
import { styleText } from "node:util";
import { setUpFileAttachments } from "./setup/setUpFileAttachments";
import pLimit from "p-limit";

type OutputFile = {
  templates: Record<string, string>;
  testForms: {
    id: string;
    usedTemplate: string;
    apiKey?: string;
  }[];
  fileAttachmentStoredInS3: string[];
};

class PostFormCreationException extends Error {
  public formId: string;

  constructor(formId: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, PostFormCreationException.prototype);

    this.formId = formId;
  }
}

const updateOutputFileOperationQueue = pLimit(1);

async function main(): Promise<void> {
  const multiBarProgress = new MultiBar({
    format: "[{bar}] | {step} ({formId})",
    barsize: 20,
    barIncompleteChar: " ",
    barCompleteChar: "=",
    forceRedraw: process.stdout.rows < config.testSetup.numberOfForms,
  });

  try {
    console.info("Setting up file attachment pool...");

    const fileAttachmentPool = await setUpFileAttachments();

    await updateOutputfile({
      saveFileAttachmentPool: { filePaths: fileAttachmentPool.map((f) => f.path) },
    });

    const setupOperations = Array.from({ length: config.testSetup.numberOfForms }).map(
      async (_, i) => {
        const progress = multiBarProgress.create(4, 0, {
          step: "Creating form",
          formId: "n/a",
        });

        const randomTemplate =
          config.testSetup.templates[Math.floor(Math.random() * config.testSetup.templates.length)];

        const parsedTemplate: Record<string, any> = JSON.parse(randomTemplate.json);

        try {
          const formId = await createForm(`Test form - ${i}`, parsedTemplate);

          await updateOutputfile({
            saveForm: {
              id: formId,
              usedTemplate: { name: randomTemplate.name, json: randomTemplate.json },
            },
          });

          progress.update(0, { formId: formId });

          try {
            if (config.testSetup.publishForm) {
              progress.update(1, { step: "Publishing form" });
              await publishForm(formId);
            }

            const apiKey = config.testSetup.enableApiAccess
              ? await (async () => {
                  progress.update(2, { step: "Creating API key" });
                  return createFormApiKey(formId);
                })()
              : undefined;

            if (apiKey) {
              await updateOutputfile({ saveApiKey: { formId: formId, key: apiKey } });
            }

            let didFailToCreateAllResponses = false;

            if (config.testSetup.numberOfResponses > 0) {
              progress.update(3, {
                step: `Creating responses (0 / ${config.testSetup.numberOfResponses})`,
              });

              let totalNumberOfSuccessfullyCreatedResponses = 0;
              let totalNumberOfFailedInsertOperations = 0;

              for await (const createResponsesProgress of createResponses(
                { id: formId, template: parsedTemplate },
                config.testSetup.numberOfResponses,
                fileAttachmentPool
              )) {
                totalNumberOfSuccessfullyCreatedResponses =
                  totalNumberOfSuccessfullyCreatedResponses +
                  createResponsesProgress.numberOfSuccessfullyCreatedResponses;
                totalNumberOfFailedInsertOperations =
                  totalNumberOfFailedInsertOperations +
                  createResponsesProgress.numberOfFailedInsertOperations;

                didFailToCreateAllResponses = totalNumberOfFailedInsertOperations > 0;

                progress.update(3, {
                  step: styleText(
                    totalNumberOfFailedInsertOperations > 0 ? "yellowBright" : "white",
                    `Creating responses (${totalNumberOfSuccessfullyCreatedResponses} / ${
                      config.testSetup.numberOfResponses
                    }${
                      totalNumberOfFailedInsertOperations > 0
                        ? ` - number of insert response operations that failed: ${totalNumberOfFailedInsertOperations}`
                        : ""
                    })`
                  ),
                });
              }
            }

            if (didFailToCreateAllResponses === false) {
              progress.update(4, { step: styleText("greenBright", "✔ Form ready") });
            }

            return {
              formId,
              usedTemplate: randomTemplate.name,
              apiKey,
            };
          } catch (error) {
            throw new PostFormCreationException(formId, (error as Error).message);
          }
        } catch (error) {
          progress.update(0, { step: styleText("redBright", "✖ Failed to fully create form") });
          throw error;
        }
      }
    );

    const setupOperationsResults = await Promise.allSettled(setupOperations);

    multiBarProgress.stop();

    const setupReport = setupOperationsResults.reduce(
      (acc, current) => {
        if (current.status === "rejected") {
          return {
            ...acc,
            formsThatFailedToBeFullySetUp: [
              ...acc.formsThatFailedToBeFullySetUp,
              {
                id:
                  (current.reason as Error).constructor === PostFormCreationException
                    ? (current.reason as PostFormCreationException).formId
                    : undefined,
                errorMessage: (current.reason as Error).message,
              },
            ],
          };
        }

        return {
          ...acc,
          numberOfFormsSuccessfullySetUp: acc.numberOfFormsSuccessfullySetUp + 1,
        };
      },
      { numberOfFormsSuccessfullySetUp: 0, formsThatFailedToBeFullySetUp: [] } as {
        numberOfFormsSuccessfullySetUp: number;
        formsThatFailedToBeFullySetUp: { id: string | undefined; errorMessage: string }[];
      }
    );

    if (setupReport.numberOfFormsSuccessfullySetUp > 0) {
      console.info(
        styleText(
          setupReport.formsThatFailedToBeFullySetUp.length > 0 ? "yellowBright" : "greenBright",
          `\n${
            setupReport.formsThatFailedToBeFullySetUp.length > 0
              ? "Oops.. Some of the forms failed to be created!"
              : "You are all set!"
          } The 'output.json' file has been generated.`
        )
      );
    }

    if (setupReport.formsThatFailedToBeFullySetUp.length > 0) {
      console.info(
        styleText(
          "redBright",
          `\n${setupReport.formsThatFailedToBeFullySetUp.length} forms failed to be fully created.`
        )
      );

      console.error("List of errors that happened during setup process:");

      for (const { errorMessage } of setupReport.formsThatFailedToBeFullySetUp) {
        console.error(errorMessage);
      }
    }
  } catch (error) {
    multiBarProgress.stop();

    console.error(
      styleText(
        "redBright",
        `\nOops! Something wrong happened. Reason: ${(error as Error).message}`
      )
    );
  }
}

async function updateOutputfile(input: {
  saveForm?: { id: string; usedTemplate: { name: string; json: string } };
  saveApiKey?: { formId: string; key: string };
  saveFileAttachmentPool?: { filePaths: string[] };
}): Promise<void> {
  return updateOutputFileOperationQueue(async () => {
    return readFile("output.json", "utf-8")
      .then(JSON.parse)
      .catch(() => ({
        templates: {},
        testForms: [],
        fileAttachmentStoredInS3: [],
      }))
      .then((outputFile: OutputFile) => {
        if (input.saveForm) {
          outputFile.templates[input.saveForm.usedTemplate.name] = input.saveForm.usedTemplate.json;
          outputFile.testForms = outputFile.testForms.concat([
            { id: input.saveForm.id, usedTemplate: input.saveForm.usedTemplate.name },
          ]);
        }

        if (input.saveApiKey) {
          const index = outputFile.testForms.findIndex(
            (test) => test.id === input.saveApiKey?.formId
          );
          outputFile.testForms[index].apiKey = input.saveApiKey.key;
        }

        if (input.saveFileAttachmentPool) {
          outputFile.fileAttachmentStoredInS3 = outputFile.fileAttachmentStoredInS3.concat(
            input.saveFileAttachmentPool.filePaths
          );
        }

        return outputFile;
      })
      .then((outputFile) => writeFile("output.json", JSON.stringify(outputFile)));
  });
}

main();
