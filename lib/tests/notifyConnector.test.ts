import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  gcNotifySendEmail: vi.fn().mockResolvedValue({}),
  notificationSendImmediate: vi.fn(),
  notificationSendDeferred: vi.fn(),
  checkOne: vi.fn(),
  logInfo: vi.fn(),
  logDebug: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("@gcforms/connectors", () => ({
  GCNotifyConnector: {
    default: vi.fn(() => ({ sendEmail: mocks.gcNotifySendEmail })),
  },
  sendImmediate: mocks.notificationSendImmediate,
  sendDeferred: mocks.notificationSendDeferred,
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    info: mocks.logInfo,
    debug: mocks.logDebug,
    error: mocks.logError,
    warn: mocks.logWarn,
  },
}));

// traceFunction must call its callback to execute the actual sendEmail logic
vi.mock("../otel", () => ({
  traceFunction: vi.fn((_name: string, fn: () => unknown) => fn()),
}));

vi.mock("@lib/cache/flags", () => ({
  checkOne: mocks.checkOne,
}));

import { sendDefaultEmail } from "@lib/integration/notifyConnector";
import { subject } from "@casl/ability";

describe("sendDefaultEmail", () => {
  describe("test-environment guard", () => {
    it("logs info and returns early without sending when APP_ENV is 'test'", async () => {
      vi.stubEnv("APP_ENV", "test");

      await sendDefaultEmail({ to: ["user@example.com"], subject: "", body: "" });

      expect(mocks.logInfo).toHaveBeenCalledWith("Mock Notify email sent.");
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
      expect(mocks.notificationSendDeferred).not.toHaveBeenCalled();
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
    });
  });

  describe("routing logic", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "production");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("routes to sendImmediate when the notification flag is on and there is no file attachment", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendDefaultEmail({
        to: ["user@example.com"],
        subject: "Test Subject",
        body: "Test Body",
      });

      expect(mocks.notificationSendImmediate).toHaveBeenCalledWith({
        emails: ["user@example.com"],
        content: expect.objectContaining({
          attachments: undefined,
          placeholders: {
            formResponse: "Test Body",
            subject: "Test Subject",
          },
        }),
      });
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
    });

    it("routes to sendDeferred when the notification flag is on and mode is deferred", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendDefaultEmail({
        to: ["user@example.com"],
        subject: "Test Subject",
        body: "Test Body",
        options: {
          mode: "deferred",
          notificationId: "notif-abc-123",
        },
      });

      expect(mocks.notificationSendDeferred).toHaveBeenCalledWith({
        notificationId: "notif-abc-123",
        emails: ["user@example.com"],
        content: expect.objectContaining({
          placeholders: {
            formResponse: "Test Body",
            subject: "Test Subject",
          },
        }),
      });
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
    });

    it("falls back to GC Notify when the notification flag is off", async () => {
      mocks.checkOne.mockResolvedValue(false);

      await sendDefaultEmail({ to: ["user@example.com"], subject: "", body: "" });

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith(
        "user@example.com",
        expect.objectContaining({
          templateId: "dummy_template_id",
        })
      );
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
    });

    it("falls back to GC Notify when bypassNotificationPipeline is true, even if the flag is on", async () => {
      mocks.checkOne.mockResolvedValue(true);

      await sendDefaultEmail({
        to: ["user@example.com"],
        subject: "",
        body: "",
        options: {
          bypassNotificationPipeline: true,
        },
      });

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith("user@example.com", expect.any(Object));
      expect(mocks.notificationSendImmediate).not.toHaveBeenCalled();
    });

    it("sends to all addresses when an array of emails is provided", async () => {
      mocks.checkOne.mockResolvedValue(false);
      const emails = ["a@example.com", "b@example.com", "c@example.com"];

      await sendDefaultEmail({ to: emails, subject: "", body: "" });

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledTimes(3);
      for (const addr of emails) {
        expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith(addr, expect.any(Object));
      }
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      vi.stubEnv("APP_ENV", "production");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("throws and logs an error when GC Notify sendEmail rejects", async () => {
      mocks.checkOne.mockResolvedValue(false);
      mocks.gcNotifySendEmail.mockRejectedValueOnce(new Error("Notify API unavailable"));

      await sendDefaultEmail({ to: ["user@example.com"], subject: "", body: "" });

      expect(mocks.logWarn).toHaveBeenCalledWith(
        "Failed to send email to user@example.com through GC Notify. Reason: Notify API unavailable"
      );
    });
  });
});
