/* eslint-disable no-console */
import readline from "readline";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { config } from "dotenv";
import { chunkArray } from "../../lib/utils";

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

const main = async () => {
  try {
    const formID = await getValue("Form ID to generate responses for:");
    const numberOfResponses = parseInt(await getValue("Number of responses to generate:"), 10);

    const encoder = new TextEncoder();

    const lambdaClient = new LambdaClient({
      region: "ca-central-1",
      retryMode: "standard",
      ...(process.env.LOCAL_AWS_ENDPOINT && { endpoint: process.env.LOCAL_AWS_ENDPOINT }),
    });

    // Generate and submit responses
    console.log("Generating responses for form.");

    const submissions = chunkArray(
      Array.from(
        { length: numberOfResponses },
        () =>
          new InvokeCommand({
            FunctionName: "Submission",
            Payload: encoder.encode(
              JSON.stringify({
                formID,
                responses: {},
                language: "en",
                securityAttribute: "Protected A",
              })
            ),
          })
      ),
      50
    );

    let numOfProcessed = 0;

    // Sending responses in batches of 50
    console.log("Sending responses to Lambda Submission function.");

    for (const submission of submissions) {
      const results = await Promise.all(
        submission.map((invokeCommand) => lambdaClient.send(invokeCommand))
      ).catch((err) => {
        console.error(err);
        throw new Error("Could not process request with Lambda Submission function");
      });
      results.forEach((result) => {
        const payload = decoder.decode(result.Payload);
        if (result.FunctionError || !JSON.parse(payload).status) {
          throw new Error("Submission API could not process form response");
        }
      });
      numOfProcessed += submission.length;
      writeWaitingPercent(numOfProcessed, numberOfResponses);
    }

    console.log(`\nData generation completed for ${numberOfResponses} responses.`);
  } catch (e) {
    console.log(e);
  }
};
// config() adds the .env variables to process.env
config();

main();
