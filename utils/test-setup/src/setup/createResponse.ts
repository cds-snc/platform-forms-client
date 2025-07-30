import config from "../../config.json";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { chunkArray, delay } from "../common/utils";
import { lambdaClientQueue, s3ClientQueue } from "../common/operationQueues";
import { v4 as uuid } from "uuid";
import { readFile } from "node:fs/promises";

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const s3Client = new S3Client({
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
  const createResponseOperationsChunks = chunkArray(
    Array.from({ length: numberOfResponses }, () => {
      const { response, s3Files } = createResponse(form.template);

      const pushFileToS3Commands = s3Files.map(
        (s3File) =>
          new PutObjectCommand({
            Bucket: "forms-staging-reliability-file-storage",
            Body: s3File.data,
            Key: s3File.key,
          })
      );

      const invokeSubmissionLambdaCommand = new InvokeCommand({
        FunctionName: "Submission",
        Payload: encoder.encode(
          JSON.stringify({
            formID: form.id,
            responses: response,
            language: "en",
            securityAttribute: "Protected A",
          })
        ),
      });

      return { pushFileToS3Commands, invokeSubmissionLambdaCommand };
    }),
    50
  );

  for (const createResponseOperations of createResponseOperationsChunks) {
    const createResponseThroughAwsOperations = createResponseOperations.map(
      async (createResponseOperation) => {
        await Promise.all(
          createResponseOperation.pushFileToS3Commands.map(async (command) => {
            await s3ClientQueue(() => {
              return s3Client.send(command).catch((error) => {
                throw new Error(
                  `Could not successfully push file attachments to S3. Reason: ${
                    (error as Error).message
                  }`
                );
              });
            });
          })
        );

        await delay(2000);

        await lambdaClientQueue(() => {
          return lambdaClient
            .send(createResponseOperation.invokeSubmissionLambdaCommand)
            .then((response) => {
              if (response.StatusCode !== 200 || response.FunctionError) {
                throw new Error(
                  `Submission lambda execution failure. Reason: ${response.Payload?.transformToString()}`
                );
              }
            })
            .catch((error) => {
              throw new Error(
                `Could not successfully invoke Submission lambda. Reason: ${
                  (error as Error).message
                }`
              );
            });
        });
      }
    );

    const createResponseThroughAwsOperationsResults = await Promise.allSettled(
      createResponseThroughAwsOperations
    );

    const successVsFailureResponseCreation = createResponseThroughAwsOperationsResults.reduce(
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

function createResponse(formTemplate: Record<string, any>): {
  response: Record<string, any>;
  s3Files: { key: string; data: Buffer }[];
} {
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
          acc.response[questionId] = language === "en" ? "Test response" : "Réponse de test";
          break;
        case "textArea":
        case "richText":
          acc.response[questionId] =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ac metus sed odio rutrum eleifend. Donec eu viverra nisl. Duis sit amet accumsan lacus. Nunc eleifend justo nunc. Vestibulum vitae lectus nisl. Aenean ullamcorper dictum arcu, quis sagittis arcu bibendum non. Sed ligula libero, ornare quis augue et, elementum cursus nunc. Fusce at mollis eros. Sed sollicitudin enim ut ligula tristique, vel ultricies nulla interdum. Aenean neque lectus, mattis nec pharetra et, porttitor quis tellus. Aenean a facilisis nunc. Pellentesque et nisl nec eros vehicula bibendum at nec risus. Nam mollis, nunc sed convallis pellentesque, massa est tincidunt ex, vel efficitur dolor elit tempus sapien. Vivamus consequat nisi ipsum, non mollis massa tempus quis. Sed justo turpis, blandit quis arcu in, varius porta dolor.";
          break;
        case "dropdown":
        case "radio":
        case "checkbox":
        case "attestation":
        case "combobox":
          const randomChoice = getRandomInt(question.properties.choices.length);
          acc.response[questionId] = question.properties.choices[randomChoice][language];
          break;
        case "fileInput":
          const randomFileAttachment =
            fileAttachments[Math.floor(Math.random() * fileAttachments.length)];

          const s3FileKey = `form_attachments/${new Date().toISOString().slice(0, 10)}/${uuid()}/${
            randomFileAttachment.name
          }`;

          acc.response[questionId] = s3FileKey;
          acc.s3Files.push({ key: s3FileKey, data: randomFileAttachment.data });
          break;
        default:
          throw new Error(`Unsupported ${question.type} question type`);
      }

      return acc;
    },
    { response: {}, s3Files: [] } as {
      response: Record<string, any>;
      s3Files: { key: string; data: Buffer }[];
    }
  );
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}
