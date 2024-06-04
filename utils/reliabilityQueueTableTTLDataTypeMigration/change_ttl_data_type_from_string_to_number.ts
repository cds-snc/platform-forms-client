/* eslint-disable no-console */
import fetch from "node-fetch";

type ApiConsumer = {
  identifier: string;
  numOfReq: number;
  msBeforeLimitReset: number;
  isLimited: boolean;
  limitInNumOfReq: number;
  limitPeriodInMs: number;
};

const apiConsumers: ApiConsumer[] = [];

function buildApiConsumer(apiConsumer: ApiConsumer): () => Promise<void> {
  const executor = (): Promise<void> =>
    fetch("http://localhost:3000/api/prototype", {
      headers: {
        "API-Key": apiConsumer.identifier,
      },
    })
      .then((response) => response.json() as unknown as Record<string, unknown>)
      .then((apiResponse) => {
        if (apiResponse.success) {
          apiConsumer.numOfReq++;
          apiConsumer.isLimited = false;
          apiConsumer.msBeforeLimitReset = (apiResponse.rateLimit as Record<string, unknown>)
            .msBeforeNext as number;
          apiConsumer.limitInNumOfReq = (apiResponse.rateLimit as Record<string, unknown>)
            .remainingPoints as number;
        } else {
          apiConsumer.isLimited = true;
          apiConsumer.limitPeriodInMs = (apiResponse.error as Record<string, unknown>)
            .msBeforeNext as number;
        }
        displayResult();
        return executor();
      })
      .catch((error) => {
        console.log(`Consumer ${apiConsumer.identifier} failure => ${error.message}`);
      });
  return executor;
}

function displayResult() {
  console.clear();
  for (const consumer of apiConsumers) {
    console.log("\n");
    console.log(
      `Consumer: ${consumer.identifier} => Request counter: ${consumer.numOfReq} - ${
        consumer.isLimited
          ? `\x1b[31mLimited for ${consumer.limitPeriodInMs / 1000} seconds\x1b[0m`
          : `\x1b[32mLimited in ${consumer.limitInNumOfReq} requests - Limit reset in ${
              consumer.msBeforeLimitReset / 1000
            } seconds\x1b[0m`
      }`
    );
  }
  console.log("\n");
  console.log("Press Ctrl-C to exit...");
}

const main = async () => {
  await Promise.all(
    [...new Array(4)].map((_, i) => {
      const apiConsumer: ApiConsumer = {
        identifier: `consumer-${i}`,
        numOfReq: 0,
        msBeforeLimitReset: 0,
        isLimited: false,
        limitInNumOfReq: 0,
        limitPeriodInMs: 0,
      };
      apiConsumers.push(apiConsumer);
      return buildApiConsumer(apiConsumer)();
    })
  );
};

main();
