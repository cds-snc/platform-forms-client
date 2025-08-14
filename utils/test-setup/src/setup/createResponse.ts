import config from "../../config.json";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { chunkArray } from "../common/utils";
import { lambdaClientQueue } from "../common/operationQueues";
import { v4 as uuid } from "uuid";
import { readFile } from "node:fs/promises";
import axios from "axios";

type GeneratedResponse = {
  responses: Record<string, any>;
  attachedFiles: Record<string, number>;
};

type FileAttachmentUploadLink = {
  url: string;
  fields: Record<string, string>;
};

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const encoder = new TextEncoder();

const fileAttachments = await Promise.all(
  config.testSetup.fileAttachments.map((fileName) => {
    return readFile(`fileAttachments/${fileName}`).then((data) => ({ name: fileName, data }));
  })
);

export async function* createResponses(
  form: { id: string; template: Record<string, any> },
  numberOfResponses: number
) {
  const generatedResponseChunks = chunkArray(
    Array.from({ length: numberOfResponses }, () => {
      return generateResponse(form.template);
    }),
    100
  );

  for (const generatedResponseChunk of generatedResponseChunks) {
    const invokeSubmissionLambdaOperations = generatedResponseChunk.map(
      async (generatedResponse) => {
        const submissionLambdaResponse = await lambdaClientQueue(() => {
          return lambdaClient
            .send(
              new InvokeCommand({
                FunctionName: "Submission",
                Payload: encoder.encode(
                  JSON.stringify({
                    formID: form.id,
                    responses: generatedResponse.responses,
                    language: "en",
                    securityAttribute: "Protected A",
                  })
                ),
              })
            )
            .then((commandOutput) => {
              if (commandOutput.StatusCode !== 200 || commandOutput.FunctionError) {
                throw new Error(
                  `Submission lambda execution failure. Reason: ${commandOutput.Payload?.transformToString()}`
                );
              }

              return JSON.parse(commandOutput.Payload?.transformToString() ?? "{}") as {
                status: boolean;
                submissionId?: string;
                fileURLMap?: Record<string, FileAttachmentUploadLink>;
              };
            })
            .catch((error) => {
              throw new Error(
                `Could not successfully invoke Submission lambda. Reason: ${(error as Error).message}`
              );
            });
        });

        if (
          submissionLambdaResponse.status === false ||
          submissionLambdaResponse.submissionId === undefined
        ) {
          throw new Error("Submission lambda failed to save submission");
        }

        if (Object.keys(generatedResponse.attachedFiles).length > 0) {
          const { fileURLMap } = submissionLambdaResponse;

          if (
            fileURLMap === undefined ||
            Object.keys(generatedResponse.attachedFiles).length !== Object.keys(fileURLMap).length
          ) {
            throw new Error(
              "There is a mismatch between the number of attached files we want to upload and the number of upload links the lambda gave us"
            );
          }

          const uploadAttachedFileOperations = Object.entries(generatedResponse.attachedFiles).map(
            ([fileId, fileIndex]) => {
              const fileAttachmentUploadLink = fileURLMap[fileId];

              if (fileAttachmentUploadLink === undefined) {
                throw new Error("Could not find file attachment upload link");
              }

              return uploadFileAttachment(fileIndex, fileAttachmentUploadLink);
            }
          );

          await Promise.all(uploadAttachedFileOperations);
        }
      }
    );

    const invokeSubmissionLambdaOperationsResults = await Promise.allSettled(
      invokeSubmissionLambdaOperations
    );

    const successVsFailureResponseCreation = invokeSubmissionLambdaOperationsResults.reduce(
      (acc, current) => {
        return current.status === "fulfilled"
          ? { ...acc, numberOfSuccessfulResponses: acc.numberOfSuccessfulResponses + 1 }
          : { ...acc, numberOfFailedResponses: acc.numberOfFailedResponses + 1 };
      },
      { numberOfSuccessfulResponses: 0, numberOfFailedResponses: 0 }
    );

    yield successVsFailureResponseCreation;
  }
}

function generateResponse(formTemplate: Record<string, any>): GeneratedResponse {
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
          const randomFileIndex = Math.floor(Math.random() * fileAttachments.length);
          const randomFileAttachment = fileAttachments[randomFileIndex];

          const attachmentIdentifier = uuid();

          acc.responses[questionId] = {
            id: attachmentIdentifier,
            name: randomFileAttachment.name,
            size: randomFileAttachment.data.byteLength,
          };

          acc.attachedFiles[attachmentIdentifier] = randomFileIndex;
          break;
        default:
          throw new Error(`Unsupported ${question.type} question type`);
      }

      return acc;
    },
    { responses: {}, attachedFiles: {} } as {
      responses: Record<string, any>;
      attachedFiles: Record<string, number>;
    }
  );
}

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

async function uploadFileAttachment(
  fileIndex: number,
  fileAttachmentUploadLink: FileAttachmentUploadLink
): Promise<void> {
  const file = fileAttachments[fileIndex];

  const formData = new FormData();

  Object.entries(fileAttachmentUploadLink.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  formData.append("file", new Blob([new Uint8Array(file.data)]), file.name);

  return axios
    .post(fileAttachmentUploadLink.url, formData)
    .then(() => {})
    .catch((error) => {
      throw new Error(`Failed to upload file attachment. Reason: ${(error as Error).message}`);
    });
}
