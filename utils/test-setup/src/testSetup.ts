import config from "../config.json";
import { createForm } from "./setup/createForm.js";
import { publishForm } from "./setup/publishForm.js";
import { createFormApiKey } from "./setup/createFormApiKey";
import { MultiBar } from "cli-progress";
import { createResponses } from "./setup/createResponse";
import { writeFile } from "node:fs/promises";
import { styleText } from "node:util";
import { FileAttachment, setUpFileAttachments } from "./setup/setUpFileAttachments";

class PostFormCreationException extends Error {
  public formId: string;

  constructor(formId: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, PostFormCreationException.prototype);

    this.formId = formId;
  }
}

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

            let test = false;

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

                test = totalNumberOfFailedInsertOperations > 0;

                progress.update(3, {
                  step: styleText(
                    totalNumberOfFailedInsertOperations > 0 ? "yellowBright" : "whiteBright",
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

            if (test === false) {
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
            failedToBeCreatedForms: [
              ...acc.failedToBeCreatedForms,
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
          createdForms: [
            ...acc.createdForms,
            {
              id: current.value.formId,
              usedTemplate: current.value.usedTemplate,
              apiKey: current.value.apiKey,
            },
          ],
        };
      },
      { createdForms: [], failedToBeCreatedForms: [] } as {
        createdForms: { id: string; usedTemplate: string; apiKey: string | undefined }[];
        failedToBeCreatedForms: { id: string | undefined; errorMessage: string }[];
      }
    );

    await generateOutputFile(setupReport, fileAttachmentPool);

    if (setupReport.createdForms.length > 0) {
      console.info(
        styleText(
          setupReport.failedToBeCreatedForms.length > 0 ? "yellowBright" : "greenBright",
          `\n${
            setupReport.failedToBeCreatedForms.length > 0
              ? "Oops.. Some of the forms failed to be created!"
              : "You are all set!"
          } The 'output.json' file has been generated.`
        )
      );
    }

    if (setupReport.failedToBeCreatedForms.length > 0) {
      console.info(
        styleText(
          "redBright",
          `\n${setupReport.failedToBeCreatedForms.length} forms failed to be fully created.`
        )
      );

      console.error("List of errors that happened during setup process:");

      for (const { errorMessage } of setupReport.failedToBeCreatedForms) {
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

function generateOutputFile(
  setupReport: {
    createdForms: { id: string; usedTemplate: string; apiKey: string | undefined }[];
    failedToBeCreatedForms: { id: string | undefined; errorMessage: string }[];
  },
  fileAttachmentPool: FileAttachment[]
): Promise<void> {
  const templates = config.testSetup.templates.reduce(
    (acc, current) => {
      acc[current.name] = current.json;
      return acc;
    },
    {} as Record<string, string>
  );

  const testForms = setupReport.createdForms.map((f) => ({
    id: f.id,
    usedTemplate: f.usedTemplate,
    apiKey: f.apiKey,
  }));

  const failedToBeSetUpTestForms = setupReport.failedToBeCreatedForms
    .filter((f) => f.id !== undefined)
    .map((f) => f.id as string);

  const fileAttachmentPoolAsListOfFilePath = fileAttachmentPool.map((file) => file.path);

  return writeFile(
    "output.json",
    JSON.stringify({
      templates,
      testForms,
      failedToBeSetUpTestForms,
      fileAttachmentStoredInS3: fileAttachmentPoolAsListOfFilePath,
    })
  );
}

main();
