/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { jest } from "@jest/globals";
import {
  SQSClient as SQSClientType,
  SendMessageCommand as SendMessageCommandType,
} from "@aws-sdk/client-sqs";
import { logEvent as logEventType } from "@lib/auditLogs";

jest.mock("@aws-sdk/client-sqs");

let createdEnv: jest.Replaced<typeof process.env> | undefined = undefined;

describe("Audit Log Tests", () => {
  beforeEach(() => {
    createdEnv = jest.replaceProperty(process, "env", {
      ...process.env,
      AUDIT_LOG_QUEUE_URL: "test_queue_url",
    });
  });
  afterAll(() => {
    createdEnv?.restore();
  });

  describe("SQS Setup tests", () => {
    // The reinitializtion of modules is required to refresh the SQS Setup state
    beforeEach(async () => {
      jest.resetModules();
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
        (reinitializedSendMessageCommand as jest.MockedFunction<any>).mock.calls[0][0]
      ).toMatchObject({
        QueueUrl: "test_queue_url",
      });
    });
    it("Uses the call to AWS to set the SQS instance URL", async () => {
      createdEnv?.restore();
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
      (reinitializedSQSClient.prototype.send as jest.MockedFunction<any>).mockResolvedValue({
        QueueUrl: "aws_test_url",
      });
      await reinitializedLogEvent("1", { type: "User", id: "1" }, "UserSignIn");
      expect(reinitializedSendMessageCommand).toHaveBeenCalledTimes(1);
      expect(
        (reinitializedSendMessageCommand as jest.MockedFunction<any>).mock.calls[0][0]
      ).toMatchObject({
        QueueUrl: "aws_test_url",
      });
    });
  });
  describe("Functionality Tests", () => {
    let logEvent: typeof logEventType;
    let mockedSQSClient: jest.MockedClass<typeof SQSClientType>;
    let mockedSendMessageCommand: jest.MockedClass<typeof SendMessageCommandType>;

    beforeAll(async () => {
      // Needed because we've already reset and cleared the modules in other tests.
      // Have to reinitialize all modules so automocking works
      const { reinitializedSendMessageCommand, reinitializedSQSClient } = await import(
        "@aws-sdk/client-sqs"
      ).then((module) => ({
        reinitializedSendMessageCommand: module.SendMessageCommand,
        reinitializedSQSClient: module.SQSClient,
      }));
      mockedSQSClient = jest.mocked(reinitializedSQSClient);
      mockedSendMessageCommand = jest.mocked(reinitializedSendMessageCommand);
      logEvent = await import("@lib/auditLogs").then((module) => module.logEvent);
    });
    it("Sends a properly formatted log to Audit Log Queue", async () => {
      const currentTimeStamp = Date.now();
      jest.spyOn(global.Date, "now").mockImplementationOnce(() => currentTimeStamp);

      await logEvent("1", { type: "User", id: "1" }, "UserSignIn");
      expect(mockedSQSClient.prototype.send).toBeCalledTimes(1);
      expect(mockedSendMessageCommand).toBeCalledWith({
        MessageBody: JSON.stringify({
          userID: "1",
          event: "UserSignIn",
          timestamp: currentTimeStamp,
          subject: "User#1",
        }),
        QueueUrl: "aws_test_url",
      });
    });
  });
});
