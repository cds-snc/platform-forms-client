import type { MockedFunction } from "vitest";
import {
  SQSClient as SQSClientType,
  SendMessageCommand as SendMessageCommandType,
} from "@aws-sdk/client-sqs";
import { logEvent as logEventType } from "@lib/auditLogs";

vi.mock("@aws-sdk/client-sqs");
vi.unmock("@lib/auditLogs");
vi.mock("@lib/ip", () => {
  return {
    getClientIp: vi.fn(() => Promise.resolve("1.1.1.1")),
  };
});

let originalEnv: NodeJS.ProcessEnv | undefined = undefined;

describe("Audit Log Tests", () => {
  beforeEach(() => {
    originalEnv = process.env;
    process.env = {
      ...process.env,
      AUDIT_LOG_QUEUE_URL: "test_queue_url",
    };
  });
  afterAll(() => {
    if (originalEnv) process.env = originalEnv;
  });

  describe("SQS Setup tests", () => {
    // The reinitializtion of modules is required to refresh the SQS Setup state
    beforeEach(async () => {
      vi.resetModules();
    });
    it("Uses the ENV var to set the SQS instance URL", async () => {
      expect(process.env.AUDIT_LOG_QUEUE_URL).toBeTruthy();
      const reinitializedLogEvent = await import("@lib/auditLogs").then(
        (module) => module.logEvent
      );
      const reinitializedSendMessageCommand = await import("@aws-sdk/client-sqs").then(
        (module) => module.SendMessageCommand
      );

      await reinitializedLogEvent("1", { type: "User", id: "1" }, "UserSignIn");
      expect(reinitializedSendMessageCommand).toHaveBeenCalledTimes(1);
      expect(
        (reinitializedSendMessageCommand as unknown as MockedFunction<(...args: unknown[]) => unknown>).mock.calls[0][0]
      ).toMatchObject({
        QueueUrl: "test_queue_url",
      });
    });
    it("Uses the call to AWS to set the SQS instance URL", async () => {
      delete process.env.AUDIT_LOG_QUEUE_URL;
      expect(process.env.AUDIT_LOG_QUEUE_URL).toBeFalsy();
      const reinitializedLogEvent = await import("@lib/auditLogs").then(
        (module) => module.logEvent
      );
      const { reinitializedSendMessageCommand, reinitializedSQSClient } = await import(
        "@aws-sdk/client-sqs"
      ).then((module) => ({
        reinitializedSendMessageCommand: module.SendMessageCommand,
        reinitializedSQSClient: module.SQSClient,
      }));

      // Remove the env var set by test setup
      (reinitializedSQSClient.prototype.send as unknown as MockedFunction<(...args: unknown[]) => unknown>).mockResolvedValue({
        QueueUrl: "aws_test_url",
      });
      await reinitializedLogEvent("1", { type: "User", id: "1" }, "UserSignIn");
      expect(reinitializedSendMessageCommand).toHaveBeenCalledTimes(1);
      expect(
        (reinitializedSendMessageCommand as unknown as MockedFunction<(...args: unknown[]) => unknown>).mock.calls[0][0]
      ).toMatchObject({
        QueueUrl: "aws_test_url",
      });
    });
  });
  describe("Functionality Tests", () => {
    let logEvent: typeof logEventType;
    let mockedSQSClient: MockedFunction<typeof SQSClientType>;
    let mockedSendMessageCommand: MockedFunction<typeof SendMessageCommandType>;

    beforeAll(async () => {
      // Needed because we've already reset and cleared the modules in other tests.
      // Have to reinitialize all modules so automocking works
      const { reinitializedSendMessageCommand, reinitializedSQSClient } = await import(
        "@aws-sdk/client-sqs"
      ).then((module) => ({
        reinitializedSendMessageCommand: module.SendMessageCommand,
        reinitializedSQSClient: module.SQSClient,
      }));
      mockedSQSClient = vi.mocked(reinitializedSQSClient);
      mockedSendMessageCommand = vi.mocked(reinitializedSendMessageCommand);
      logEvent = await import("@lib/auditLogs").then((module) => module.logEvent);
    });
    it("Sends a properly formatted log to Audit Log Queue", async () => {
      const currentTimeStamp = Date.now();
      vi.spyOn(global.Date, "now").mockImplementationOnce(() => currentTimeStamp);

      await logEvent("1", { type: "User", id: "1" }, "UserSignIn");
      expect(mockedSQSClient.prototype.send).toHaveBeenCalledTimes(1);
      expect(mockedSendMessageCommand).toHaveBeenCalledWith({
        MessageBody: JSON.stringify({
          userId: "1",
          event: "UserSignIn",
          timestamp: currentTimeStamp,
          subject: { type: "User", id: "1" },
          clientIp: "1.1.1.1",
        }),
        QueueUrl: "aws_test_url",
      });
    });
  });
});
