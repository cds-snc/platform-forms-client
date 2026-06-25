import { GCNotifyConnector, notification, type Personalisation } from "@gcforms/connectors";
import { logMessage } from "@lib/logger";
import { traceFunction } from "../otel";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

type SendEmailOptions = { mode?: "immediate" } | { mode: "deferred"; notificationId: string };

const gcNotifyConnector = GCNotifyConnector.default(process.env.NOTIFY_API_KEY ?? "");

export const sendEmail = async (
  email: string | string[],
  personalisation: Personalisation,
  type: string,
  options?: SendEmailOptions
) => {
  return traceFunction("sendEmail", async () => {
    try {
      if (process.env.APP_ENV === "test") {
        logMessage.info("Mock Notify email sent.");
        return;
      }

      const emails = Array.isArray(email) ? email : [email];
      const notificationsEnabled = await checkOne(FeatureFlags.notifications);
      const hasFileAttachment = "application_file" in personalisation;

      if (notificationsEnabled && !hasFileAttachment) {
        const subject = typeof personalisation.subject === "string" ? personalisation.subject : "";
        const body =
          typeof personalisation.formResponse === "string" ? personalisation.formResponse : "";

        if (options?.mode === "deferred") {
          await notification.sendDeferred({
            notificationId: options.notificationId,
            emails,
            subject,
            body,
          });
        } else {
          await notification.sendImmediate({ emails, subject, body });
        }

        logMessage.debug(
          `Queued Notification email via ${options?.mode === "deferred" ? "sendDeferred" : "sendImmediate"} successfully`
        );
        return;
      }

      // Fallback: send directly via GC Notify (flag off, or email has a file attachment)

      const templateId = process.env.TEMPLATE_ID;
      if (!templateId) {
        throw new Error("No Notify template ID configured.");
      }

      await Promise.all(
        emails.map((addr) => gcNotifyConnector.sendEmail(addr, templateId, personalisation))
      );

      logMessage.debug("Sent email directly to GC Notify successfully");
    } catch (error) {
      logMessage.error(
        `Failed to send ${type} email to ${Array.isArray(email) ? email.join(", ") : email} through GC Notify. Reason: ${
          (error as Error).message
        }`
      );

      throw error;
    }
  });
};
