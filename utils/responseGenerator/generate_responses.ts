/* eslint-disable no-console */
import readline from "readline";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { config } from "dotenv";
import { chunkArray } from "../../lib/utils";
import axios from "axios";
import { load } from "cheerio";

const decoder = new TextDecoder();

interface SubmissionRequestBody {
  [key: string]: Response;
}

type Response = string | string[] | number | Record<string, unknown>[] | Record<string, unknown>;

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
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const twirlTimer = () => {
  var P = ["\\", "|", "/", "-"];
  var x = 0;
  return setInterval(function () {
    process.stdout.write("\r" + P[x++]);
    x &= 3;
  }, 250);
};

function clearStdout() {
  readline.cursorTo(process.stdout, 0);
  process.stdout.write("");
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function writeWaitingPercent(current: number, total: number) {
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`waiting ... ${Math.round((current / total) * 100)}%`);
}

const createResponse = (formTemplate: any): SubmissionRequestBody => {
  const response: SubmissionRequestBody = {};
  const language = getRandomInt(1) === 0 ? "en" : "fr";

  // For each element in the form template, generate a response
  formTemplate.layout.forEach((questionId: number) => {
    const question = formTemplate.elements.find((element: any) => element.id === questionId);
    if (!question) {
      throw new Error("Could not find question in form template");
    }
    switch (question.type) {
      case "textField":
        return (response[questionId] = language === "en" ? "Test response" : "Réponse de test");

      case "textArea":
      case "richText":
        return (response[questionId] =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ac metus sed odio rutrum eleifend. Donec eu viverra nisl. Duis sit amet accumsan lacus. Nunc eleifend justo nunc. Vestibulum vitae lectus nisl. Aenean ullamcorper dictum arcu, quis sagittis arcu bibendum non. Sed ligula libero, ornare quis augue et, elementum cursus nunc. Fusce at mollis eros. Sed sollicitudin enim ut ligula tristique, vel ultricies nulla interdum. Aenean neque lectus, mattis nec pharetra et, porttitor quis tellus. Aenean a facilisis nunc. Pellentesque et nisl nec eros vehicula bibendum at nec risus. Nam mollis, nunc sed convallis pellentesque, massa est tincidunt ex, vel efficitur dolor elit tempus sapien. Vivamus consequat nisi ipsum, non mollis massa tempus quis. Sed justo turpis, blandit quis arcu in, varius porta dolor.");

      case "dropdown":
      case "radio":
      case "checkbox":
      case "attestation":
        const numOfChoices = question.properties.choices.length;
        const randomChoice = getRandomInt(numOfChoices);
        return (response[questionId] = question.properties.choices[randomChoice][language]);

      default:
        throw new Error("Unsupported question type");
    }
  });
  return response;
};

const main = async () => {
  try {
    const formID = await getValue("Form ID to generate responses for:");
    const numberOfResponses = parseInt(await getValue("Number of responses to generate:"), 10);
    const appUrl = await getValue("App Environment:  [0] Local || [1] Staging").then((ans) =>
      ans === "1" ? "https://forms-staging.cdssandbox.xyz" : "http://localhost:3000"
    );

    console.log(`Getting form template from ${appUrl}`);

    // Get the form template
    const formTemplate = await axios.get(`${appUrl}/id/${formID}`).then(({ data }) => {
      const nextData = load(data)("#__NEXT_DATA__").html();
      if (!nextData) {
        throw new Error("Could not retrieve data from web page");
      }
      return JSON.parse(nextData).props?.pageProps?.formRecord?.form;
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
                responses: createResponse(formTemplate),
                language: "en",
                securityAttribute: "Protected A",
              })
            ),
          })
      ),
      process.env.LOCAL_AWS_ENDPOINT ? 2 : 50
    );

    let numOfProcessed = 0;

    console.log("Warming up Lambda functions for 30 seconds");
    const timer = twirlTimer();

    const results = await Promise.all(
      submissions[0].map((invokeCommand) => lambdaClient.send(invokeCommand))
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

    await delay(30000);
    submissions.shift();
    clearInterval(timer);
    clearStdout();

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
