import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  gcNotifySendEmail: vi.fn().mockResolvedValue({}),
  notificationSendImmediate: vi.fn(),
  notificationSendDeferred: vi.fn(),
  checkOne: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@gcforms/connectors", () => ({
  GCNotifyConnector: {
    default: vi.fn(() => ({ sendEmail: mocks.gcNotifySendEmail })),
  },
  notification: {
    sendImmediate: mocks.notificationSendImmediate,
    sendDeferred: mocks.notificationSendDeferred,
  },
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    info: mocks.logInfo,
    debug: mocks.logDebug,
    error: mocks.logError,
    warn: vi.fn(),
  },
}));

// traceFunction must call its callback to execute the actual sendEmail logic
vi.mock("../otel", () => ({
  traceFunction: vi.fn((_name: string, fn: () => unknown) => fn()),
}));

vi.mock("@lib/cache/flags", () => ({
  checkOne: mocks.checkOne,
}));

import { sendEmail } from "@lib/integration/notifyConnector";

const basePersonalisation = {
  subject: "Test Subject",
  formResponse: "Test Body",
};

describe("sendEmail", () => {
  describe("test-environment guard", () => {
    it("logs info and returns early without sending when APP_ENV is 'test'", async () => {
      vi.stubEnv("APP_ENV", "test");

      await sendEmail("user@example.com", basePersonalisation, "testType");

      expect(mocks.logInfo).toHaveBeenCalledWith("Mock Notify email sent.");
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
      expect(mocks.notificationSendDeferred).not.toHaveBeenCalled();
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
    });
  });

  describe("routing logic", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("TEMPLATE_ID", "test-template-id");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("routes to sendImmediate when the notification flag is on and there is no file attachment", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendEmail("user@example.com", basePersonalisation, "testType");

      expect(mocks.notificationSendImmediate).toHaveBeenCalledWith({
        emails: ["user@example.com"],
        subject: "Test Subject",
        body: "Test Body",
      });
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
    });

    it("routes to sendDeferred when the notification flag is on and mode is deferred", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendEmail("user@example.com", basePersonalisation, "testType", {
        mode: "deferred",
        notificationId: "notif-abc-123",
      });

      expect(mocks.notificationSendDeferred).toHaveBeenCalledWith({
        notificationId: "notif-abc-123",
        emails: ["user@example.com"],
        subject: "Test Subject",
        body: "Test Body",
      });
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
    });

    it("falls back to GC Notify when the notification flag is off", async () => {
      mocks.checkOne.mockResolvedValue(false);

      await sendEmail("user@example.com", basePersonalisation, "testType");

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith(
        "user@example.com",
        "test-template-id",
        basePersonalisation
      );
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
    });

    it("falls back to GC Notify when personalisation contains a file attachment, even if the flag is on", async () => {
      mocks.checkOne.mockResolvedValue(true);
      const personalisationWithFile = { ...basePersonalisation, application_file: "base64data" };

      await sendEmail("user@example.com", personalisationWithFile, "testType");

      expect(mocks.gcNotifySendEmail).toHaveBeenCalled();
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
    });

    it("falls back to GC Notify when bypassNotificationPipeline is true, even if the flag is on", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendEmail("user@example.com", basePersonalisation, "testType", {
        bypassNotificationPipeline: true,
      });

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith(
        "user@example.com",
        "test-template-id",
        basePersonalisation
      );
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
    });

    it("sends to all addresses when an array of emails is provided", async () => {
      mocks.checkOne.mockResolvedValue(false);
      const emails = ["a@example.com", "b@example.com", "c@example.com"];

      await sendEmail(emails, basePersonalisation, "testType");

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledTimes(3);
      for (const addr of emails) {
        expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith(
          addr,
          "test-template-id",
          basePersonalisation
        );
      }
    });

    it("normalises a single email string into the array passed to the pipeline", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendEmail("solo@example.com", basePersonalisation, "testType");

      expect(mocks.notificationSendImmediate).toHaveBeenCalledWith(
        expect.objectContaining({ emails: ["solo@example.com"] })
      );
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "production");
      vi.stubEnv("TEMPLATE_ID", "test-template-id");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("throws and logs an error when GC Notify sendEmail rejects", async () => {
      mocks.checkOne.mockResolvedValue(false);
      mocks.gcNotifySendEmail.mockRejectedValueOnce(new Error("Notify API unavailable"));

      await sendEmail("user@example.com", basePersonalisation, "testType");

      expect(mocks.logError).toHaveBeenCalledWith(
        "Failed to send testType email to user@example.com through GC Notify. Reason: Notify API unavailable"
      );
    });

    it("throws when TEMPLATE_ID is not configured", async () => {
      mocks.checkOne.mockResolvedValue(false);
      vi.stubEnv("TEMPLATE_ID", "");

      await expect(sendEmail("user@example.com", basePersonalisation, "testType")).rejects.toThrow(
        "No Notify template ID configured."
      );
    });
  });
});
