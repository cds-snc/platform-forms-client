/* eslint-disable no-console */
import readline from "readline";
import {
  SQSClient,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { config } from "dotenv";

const decoder = new TextDecoder();

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

const twirlTimer = () => {
  var P = ["\\", "|", "/", "-"];
  var x = 0;
  return setInterval(function () {
    process.stdout.write("\r" + P[x++]);
    x &= 3;
  }, 250);
};

function writeWaitingPercent(current: number, total: number) {
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`waiting ... ${Math.round((current / total) * 100)}%`);
}

const getQueueURL = async (client: SQSClient) => {
  const data = await client.send(
    new GetQueueUrlCommand({
      QueueName: "submission_processing.fifo",
    })
  );
  return data.QueueUrl;
};

const main = async () => {
  try {
    const formID = await getValue("Form ID to generate responses for:");
    const numberOfResponses = parseInt(await getValue("Number of responses to generate:"), 10);

    const encoder = new TextEncoder();

    // Setup all required services

    const sqsClient = new SQSClient({
      region: process.env.AWS_REGION ?? "ca-central-1",
      endpoint: process.env.LOCAL_AWS_ENDPOINT,
    });

    const sqsQueueUrl = await getQueueURL(sqsClient);

    const lambdaClient = new LambdaClient({
      region: "ca-central-1",
      retryMode: "standard",
      endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
    });

    // Generate and submit responses
    console.log("Generating responses for form.");

    for (let response = 0; response < numberOfResponses; response++) {
      const command = new InvokeCommand({
        FunctionName: "Submission",
        Payload: encoder.encode(
          JSON.stringify({
            formID,
            responses: {},
            language: "en",
            securityAttribute: "Protected A",
          })
        ),
      });
      try {
        const response = await lambdaClient.send(command);

        const payload = decoder.decode(response.Payload);
        if (response.FunctionError || !JSON.parse(payload).status) {
          throw new Error("Submission API could not process form response");
        }
      } catch (err) {
        console.error(err as Error);
        throw new Error("Could not process request with Lambda Submission function");
      }
      writeWaitingPercent(response + 1, numberOfResponses);
    }

    // Retrieve and process responses from Reliabilty Queue
    let messagesWaiting = true;

    console.log("\nProcessing responses in Reliability Queue");

    const workingOnProcessing = twirlTimer();
    while (messagesWaiting) {
      try {
        const receiveCommand = new ReceiveMessageCommand({
          QueueUrl: sqsQueueUrl,
          MaxNumberOfMessages: 1,
          VisibilityTimeout: 30,
          WaitTimeSeconds: 5,
        });
        const { Messages } = await sqsClient.send(receiveCommand);
        // If there are no messages to process stop the loop
        if (!Messages) {
          messagesWaiting = false;
          break;
        }
        const { Body: formResponse, ReceiptHandle } = Messages[0];

        const reliabilityCommand = new InvokeCommand({
          FunctionName: "Reliability",
          Payload: encoder.encode(
            JSON.stringify({
              Records: [
                {
                  body: formResponse,
                },
              ],
            })
          ),
        });
        const response = await lambdaClient.send(reliabilityCommand);

        if (response.FunctionError) {
          throw new Error("Submission API could not process form response");
        }

        const deleteCommand = new DeleteMessageCommand({
          QueueUrl: sqsQueueUrl,
          ReceiptHandle,
        });
        sqsClient.send(deleteCommand);
      } catch (err) {
        console.error(err as Error);
        throw new Error("Could not process request with Lambda Submission function");
      }
    }
    clearInterval(workingOnProcessing);
    console.log(`\nData generation completed for ${numberOfResponses} responses.`);
  } catch (e) {
    console.log(e);
  }
};
// config() adds the .env variables to process.env
config();

main();
