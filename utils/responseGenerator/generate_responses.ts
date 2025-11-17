/* eslint-disable no-console */
import readline from "readline";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { config } from "dotenv";
import { chunkArray } from "../../lib/utils";
import axios from "axios";
import {
  getRandomInt,
  generateResponseForQuestion,
  loadFiles,
  TestFile,
} from "./lib/responseGenerator";
import { uploadFile } from "./lib/fileUpload";

interface SubmissionRequestBody {
  [key: string]: Response;
}

type Response = string | string[] | number | Record<string, unknown>[] | Record<string, unknown>;

type SignedURLMap = Record<string, PostSignedURL>;

type PostSignedURL = {
  url: string;
  fields: Record<string, string>;
};

function getValue(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<string>((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// const twirlTimer = () => {
//   var P = ["\\", "|", "/", "-"];
//   var x = 0;
//   return setInterval(function () {
//     process.stdout.write("\r" + P[x++]);
//     x &= 3;
//   }, 250);
// };

function writeWaitingPercent(current: number, total: number) {
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`waiting ... ${Math.round((current / total) * 100)}%`);
}

const createResponse = (formTemplate: any) => {
  const responses: SubmissionRequestBody = {};
  const fileRefs: Record<string, TestFile> = {};
  const language = getRandomInt(1) === 0 ? "en" : "fr";

  // For each element in the form template, generate a response
  formTemplate.layout.forEach((questionId: number) => {
    const question = formTemplate.elements.find((element: any) => element.id === questionId);
    if (!question) {
      throw new Error("Could not find question in form template");
    }

    // modifies the `response` object directly
    generateResponseForQuestion(language, question, responses, fileRefs);
  });
  return { responses, fileRefs };
};

const main = async () => {
  try {
    const formID = await getValue("Form ID to generate responses for: ");
    const numberOfResponses = parseInt(await getValue("Number of responses to generate: "), 10);
    const appEnv = await getValue("App Environment:  [0] Local || [1] Staging: ").then((ans) =>
      ans === "1" ? "staging" : "development"
    );

    console.info(`Getting form template from ${appEnv}`);
    process.env.AWS_PROFILE = appEnv;

    // Get the form template
    const formTemplate = await axios
      .get(
        `${
          appEnv === "staging" ? "https://forms-staging.cdssandbox.xyz" : "http://localhost:3000"
        }/api/templates/${formID}`
      )
      .then(({ data }) => {
        return data.form;
      });

    if (!formTemplate) {
      throw new Error("Could not retrieve form template");
    }

    const encoder = new TextEncoder();

    const lambdaClient = new LambdaClient({
      region: "ca-central-1",
      retryMode: "standard",
      ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
    });

    // Load files if required to generate responses
    if (formTemplate.elements.some((element: { type: string }) => element.type === "fileInput")) {
      console.info(`File input field detected... loading test files`);
      await loadFiles();
    }

    // Generate and submit responses
    console.info("Generating responses for form.");

    const submissions = chunkArray(
      Array.from({ length: numberOfResponses }, () => {
        const { responses, fileRefs } = createResponse(formTemplate);
        return {
          invokeCommand: new InvokeCommand({
            FunctionName: "Submission",
            Payload: encoder.encode(
              JSON.stringify({
                formID,
                responses,
                language: "en",
                securityAttribute: "Protected A",
                fileChecksums: Object.entries(fileRefs).reduce(
                  (fileChecksums, [key, value]) => {
                    fileChecksums[key] = value.checksum;
                    return fileChecksums;
                  },
                  {} as Record<string, string>
                ),
              })
            ),
          }),
          fileRefs,
        };
      }),
      50
    );

    let numOfProcessed = 0;

    console.info("Sending responses to Lambda Submission function.");

    for (const chunk of submissions) {
      await Promise.all(
        chunk.map(async ({ invokeCommand, fileRefs }) => {
          const lambdaInvokeResponse = await lambdaClient.send(invokeCommand);
          if (lambdaInvokeResponse.StatusCode !== 200 || lambdaInvokeResponse.FunctionError) {
            // If `FunctionError` is defined then the `Payload` is an Error object
            throw new Error(
              `Submission lambda execution failure. Reason: ${lambdaInvokeResponse.Payload?.transformToString()}`
            );
          }

          const { status, submissionId, fileURLMap } = JSON.parse(
            lambdaInvokeResponse.Payload?.transformToString() ?? "{}"
          ) as { status?: boolean; submissionId?: string; fileURLMap?: SignedURLMap };

          // Check for successfull submission creation

          if (status !== true && !submissionId) {
            throw new Error(
              `Unexpected Submission lambda processing result: ${lambdaInvokeResponse.Payload?.transformToString()}`
            );
          }

          // Check if we need to process files
          if (Object.keys(fileRefs).length > 0) {
            // Check if there is a url / file count mismatch
            if (
              fileURLMap === undefined ||
              Object.keys(fileURLMap).length !== Object.keys(fileRefs).length
            )
              throw new Error("File Upload count mismatch");

            // Upload the files

            await Promise.all(
              Object.entries(fileURLMap).map(async ([fileId, signedUrl]) => {
                return uploadFile(fileRefs[fileId], signedUrl);
              })
            );
          }
        })
      ).catch((err) => {
        console.error(err);
        throw new Error("Could not process request with Lambda Submission function");
      });

      numOfProcessed += chunk.length;
      writeWaitingPercent(numOfProcessed, numberOfResponses);
    }

    console.info(`\nData generation completed for ${numberOfResponses} responses.`);
  } catch (e) {
    console.error(e);
  }
};
// config() adds the .env variables to process.env
config();

main();
