import { chunkArray, delay } from "../common/utils";
import { v4 as uuid } from "uuid";
import { FileAttachment } from "./setUpFileAttachments";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { createHash } from "node:crypto";
import pLimit from "p-limit";
import { sendBatchWriteCommandAndRetryOnUnprocessedItemsDetection } from "../common/dynamodbAdapter";

type GeneratedResponse = {
  responses: Record<string, any>;
  attachedFiles: FileAttachment[];
};

const dynamodbClient = new DynamoDBClient({
  region: "ca-central-1",
  retryMode: "standard",
});

export async function* createResponses(
  form: { id: string; template: Record<string, any> },
  numberOfResponses: number,
  fileAttachmentPool: FileAttachment[]
) {
  const operationQueue = pLimit(1);

  const existingResponseNames: Set<string> = new Set();

  const generatedResponseChunks = chunkArray(
    Array.from({ length: numberOfResponses }, () => {
      return generateResponse(form.template, fileAttachmentPool);
    }),
    100
  );

  for (const generatedResponseChunk of generatedResponseChunks) {
    // We have to create smaller chunks because we need to insert 2 items (response + confirmation) per response and we are limited by the BatchWriteItemCommand which can only insert 25 elements at a time
    const insertResponseOperations = chunkArray(generatedResponseChunk, 12)
      .map((chunk) => {
        return {
          numberOfItems: chunk.length,
          command: new BatchWriteCommand({
            RequestItems: {
              Vault: chunk.flatMap((generatedResponse) => {
                const submissionId = uuid();
                const createdAt = Date.now();

                const name = generateResponseName(existingResponseNames, submissionId, createdAt);
                existingResponseNames.add(name);

                const formSubmission = JSON.stringify(generatedResponse.responses);
                const confirmationCode = uuid();
                const formSubmissionHash = createHash("md5").update(formSubmission).digest("hex");
                const submissionAttachments = JSON.stringify(
                  generatedResponse.attachedFiles.map((attachedFile) => ({
                    name: attachedFile.name,
                    path: attachedFile.path,
                    scanStatus: "NO_THREATS_FOUND",
                  }))
                );

                return [
                  {
                    PutRequest: {
                      Item: {
                        SubmissionID: submissionId,
                        FormID: form.id,
                        NAME_OR_CONF: `NAME#${name}`,
                        FormSubmission: formSubmission,
                        FormSubmissionLanguage: "en",
                        CreatedAt: Number(createdAt),
                        SecurityAttribute: "Protected B",
                        "Status#CreatedAt": `New#${Number(createdAt)}`,
                        ConfirmationCode: confirmationCode,
                        Name: name,
                        FormSubmissionHash: formSubmissionHash,
                        SubmissionAttachments: submissionAttachments,
                      },
                    },
                  },
                  {
                    PutRequest: {
                      Item: {
                        FormID: form.id,
                        NAME_OR_CONF: `CONF#${confirmationCode}`,
                        Name: name,
                        CreatedAt: Number(createdAt),
                        ConfirmationCode: confirmationCode,
                      },
                    },
                  },
                ];
              }),
            },
          }),
        };
      })
      .map((insertCommand) => {
        return operationQueue(() => {
          return sendBatchWriteCommandAndRetryOnUnprocessedItemsDetection(
            dynamodbClient,
            insertCommand.command
          )
            .then(() => insertCommand.numberOfItems)
            .catch((error) => {
              throw new Error(`Failed to insert all items. Reason: ${(error as Error).message}.`);
            });
        });
      });

    const insertResponseOperationsResults = await Promise.allSettled(insertResponseOperations);

    const successVsFailureInsertOperations = insertResponseOperationsResults.reduce(
      (acc, current) => {
        return {
          numberOfSuccessfullyCreatedResponses:
            current.status === "fulfilled"
              ? acc.numberOfSuccessfullyCreatedResponses + current.value
              : acc.numberOfSuccessfullyCreatedResponses,
          numberOfFailedInsertOperations:
            current.status === "rejected"
              ? acc.numberOfFailedInsertOperations + 1
              : acc.numberOfFailedInsertOperations,
        };
      },
      { numberOfSuccessfullyCreatedResponses: 0, numberOfFailedInsertOperations: 0 }
    );

    // The delay is needed to avoid being rate limited by DynamoDB's API
    await delay(2500);

    yield successVsFailureInsertOperations;
  }
}

function generateResponse(
  formTemplate: Record<string, any>,
  fileAttachmentPool: FileAttachment[]
): GeneratedResponse {
  const language = getRandomInt(1) === 0 ? "en" : "fr";

  return (formTemplate.layout as number[]).reduce(
    (acc, questionId) => {
      const question = (formTemplate.elements as Record<string, any>[]).find(
        (element) => (element.id as number) === questionId
      );

      if (!question) {
        throw new Error("Could not find question in form template");
      }

      switch (question.type) {
        case "textField":
          acc.responses[questionId] = language === "en" ? "Test response" : "Réponse de test";
          break;
        case "textArea":
        case "richText":
          acc.responses[questionId] =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ac metus sed odio rutrum eleifend. Donec eu viverra nisl. Duis sit amet accumsan lacus. Nunc eleifend justo nunc. Vestibulum vitae lectus nisl. Aenean ullamcorper dictum arcu, quis sagittis arcu bibendum non. Sed ligula libero, ornare quis augue et, elementum cursus nunc. Fusce at mollis eros. Sed sollicitudin enim ut ligula tristique, vel ultricies nulla interdum. Aenean neque lectus, mattis nec pharetra et, porttitor quis tellus. Aenean a facilisis nunc. Pellentesque et nisl nec eros vehicula bibendum at nec risus. Nam mollis, nunc sed convallis pellentesque, massa est tincidunt ex, vel efficitur dolor elit tempus sapien. Vivamus consequat nisi ipsum, non mollis massa tempus quis. Sed justo turpis, blandit quis arcu in, varius porta dolor.";
          break;
        case "dropdown":
        case "radio":
        case "checkbox":
        case "attestation":
        case "combobox":
          const randomChoice = getRandomInt(question.properties.choices.length);
          acc.responses[questionId] = question.properties.choices[randomChoice][language];
          break;
        case "fileInput":
          const randomFileIndex = Math.floor(Math.random() * fileAttachmentPool.length);
          const randomFileAttachment = fileAttachmentPool[randomFileIndex];

          acc.responses[questionId] = randomFileAttachment.path;
          acc.attachedFiles = acc.attachedFiles.concat([randomFileAttachment]);
          break;
        default:
          throw new Error(`Unsupported ${question.type} question type`);
      }

      return acc;
    },
    { responses: {}, attachedFiles: [] } as {
      responses: Record<string, any>;
      attachedFiles: FileAttachment[];
    }
  );
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function generateResponseName(
  existingResponseNames: Set<string>,
  submissionId: string,
  createdAt: number
): string {
  const submissionDate = new Date(createdAt);

  let name = "";
  let shouldStop = false;
  let duplicateFound = false;

  while (shouldStop === false) {
    name = `${("0" + submissionDate.getDate()).slice(-2)}-${(
      "0" +
      (submissionDate.getMonth() + 1)
    ).slice(-2)}-${duplicateFound ? generateRandomString() : submissionId.substring(0, 5)}`;

    if (existingResponseNames.has(name)) {
      duplicateFound = true;
    } else {
      shouldStop = true;
    }
  }

  return name;
}

function generateRandomString(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const characters = letters + "0123456789";

  let result = "";

  // Ensure at least one letter
  result += letters.charAt(Math.floor(Math.random() * letters.length));

  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Shuffle result to avoid always starting with a letter
  return result
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}
