import { describe, it, expect, vi, afterEach } from "vitest";

const mocks = vi.hoisted(() => ({
  gcNotifySendEmail: vi.fn().mockResolvedValue({}),
  notificationSendImmediate: vi.fn().mockResolvedValue({}),
  notificationSendDeferred: vi.fn().mockResolvedValue({}),
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

import { sendDefaultEmail } from "@lib/integration/notifyConnector";

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
      vi.stubEnv("TEMPLATE_ID", "dummy_template_id");
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("routes to sendImmediate when there is no file attachment", async () => {
      mocks.notificationSendImmediate.mockResolvedValueOnce({});

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

    it("routes to sendDeferred when mode is deferred", async () => {
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

    it("falls back to direct GC Notify call when bypassNotificationPipeline is true", async () => {
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

    it("falls back to direct GC Notify call when use of sendImmediate throws an error", async () => {
      mocks.notificationSendImmediate.mockRejectedValueOnce(new Error("Something wrong happened"));

      await sendDefaultEmail({
        to: ["user@example.com"],
        subject: "",
        body: "",
      });

      expect(mocks.gcNotifySendEmail).toHaveBeenCalledWith("user@example.com", expect.any(Object));
    });

    it("sends to all addresses when an array of emails is provided", async () => {
      const emails = ["a@example.com", "b@example.com", "c@example.com"];

      await sendDefaultEmail({ to: emails, subject: "", body: "" });

      expect(mocks.notificationSendImmediate).toHaveBeenCalledWith({
        emails,
        content: expect.any(Object),
      });
      expect(mocks.gcNotifySendEmail).not.toHaveBeenCalled();
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
      mocks.gcNotifySendEmail.mockRejectedValueOnce(new Error("Notify API unavailable"));

      await sendDefaultEmail({
        to: ["user@example.com"],
        subject: "",
        body: "",
        options: { bypassNotificationPipeline: true },
      });

      expect(mocks.logWarn).toHaveBeenCalledWith(
        "Failed to send email to user@example.com from the application to GC Notify. Reason: Notify API unavailable"
      );
    });
  });
});
