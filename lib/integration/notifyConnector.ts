import { GCNotifyConnector, notification, type Personalisation } from "@gcforms/connectors";
import { logMessage } from "@lib/logger";
import { traceFunction } from "../otel";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

type SendEmailOptions = ({ mode?: "immediate" } | { mode: "deferred"; notificationId: string }) & {
  bypassNotificationPipeline?: boolean;
};

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
      const notificationEnabled = await checkOne(FeatureFlags.notification);
      const hasFileAttachment = "application_file" in personalisation;

      if (notificationEnabled && !hasFileAttachment && !options?.bypassNotificationPipeline) {
        const subject = typeof personalisation.subject === "string" ? personalisation.subject : "";
        const body =
          typeof personalisation.formResponse === "string" ? personalisation.formResponse : "";

        logMessage.debug(
          `Sending email through notification pipeline with option: ${options?.mode === "deferred" ? "sendDeferred" : "sendImmediate"}`
        );

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

        return;
      }

      // Fallback: send directly via GC Notify (flag off, or email has a file attachment, or bypassNotificationPipeline is true)

      const templateId = process.env.TEMPLATE_ID;

      if (!templateId) {
        throw new Error("No Notify template ID configured.");
      }

      logMessage.debug("Sending email directly through GC Notify");

      await Promise.all(
        emails.map((addr) =>
          gcNotifyConnector.sendEmail(addr, templateId, personalisation).catch((error) => {
            logMessage.warn(
              `Failed to send ${type} email to ${addr} through GC Notify. Reason: ${
                (error as Error).message
              }`
            );
          })
        )
      );
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
