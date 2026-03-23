import { Worker } from "node:worker_threads";

const DEFAULT_REGEX_TIMEOUT_MS = 1000;

const workerCode = `
const { parentPort, workerData } = require("node:worker_threads");

try {
  parentPort.postMessage({ matched: workerData.pattern.test(workerData.value) });
} catch (error) {
  parentPort.postMessage({
    error: error instanceof Error ? error.message : String(error),
  });
}
`;

export type RegexPattern = RegExp | string;

export interface TestRegexWithTimeoutOptions {
  timeoutMs?: number;
  flags?: string;
}

export interface TestRegexWithTimeoutResult {
  matched: boolean;
  timedOut: boolean;
}

export const testRegexWithTimeout = async (
  pattern: RegExp,
  value: string,
  timeoutMs = DEFAULT_REGEX_TIMEOUT_MS
): Promise<TestRegexWithTimeoutResult> => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError("timeoutMs must be a positive number");
  }

  return new Promise<TestRegexWithTimeoutResult>((resolve, reject) => {
    const worker = new Worker(workerCode, {
      eval: true,
      workerData: {
        pattern,
        value,
      },
    });

    let finished = false;

    const finish = async (callback: () => void) => {
      if (finished) {
        return;
      }

      finished = true;
      clearTimeout(timer);
      await worker.terminate().catch(() => undefined);
      callback();
    };

    const timer = setTimeout(() => {
      void finish(() => resolve({ matched: false, timedOut: true }));
    }, timeoutMs);

    worker.once("message", (message: { matched?: boolean; error?: string }) => {
      if (message.error) {
        void finish(() => reject(new Error(message.error)));
        return;
      }

      void finish(() => resolve({ matched: Boolean(message.matched), timedOut: false }));
    });

    worker.once("error", (error) => {
      void finish(() => reject(error));
    });
  });
};
