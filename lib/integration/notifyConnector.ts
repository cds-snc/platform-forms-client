import {
  EmailAttachment,
  EmailContent,
  GCNotifyConnector,
  sendImmediate,
  sendDeferred,
} from "@gcforms/connectors";
import { logMessage } from "@lib/logger";
import { traceFunction } from "../otel";
import { checkOne } from "@lib/cache/flags";
import { FeatureFlags } from "@lib/cache/types";

type SendEmailOptions = ({ mode?: "immediate" } | { mode: "deferred"; notificationId: string }) & {
  bypassNotificationPipeline?: boolean;
};

const gcNotifyConnector = GCNotifyConnector.default(process.env.NOTIFY_API_KEY ?? "");

export function sendDefaultEmail(input: {
  to: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  options?: SendEmailOptions;
}): Promise<void> {
  return sendEmail(
    input.to,
    {
      templateId: process.env.TEMPLATE_ID ?? "undefined",
      placeholders: {
        subject: input.subject,
        formResponse: input.body,
      },
      attachments: input.attachments,
    },
    input.options
  );
}

async function sendEmail(
  to: string[],
  content: EmailContent,
  options?: SendEmailOptions
): Promise<void> {
  return traceFunction("sendEmail", async () => {
    try {
      if (process.env.APP_ENV === "test") {
        logMessage.info("Mock Notify email sent.");
        return;
      }

      const notificationEnabled = await checkOne(FeatureFlags.notification);

      if (notificationEnabled && options?.bypassNotificationPipeline !== true) {
        logMessage.debug(
          `Sending email through notification pipeline with option: ${options?.mode === "deferred" ? "sendDeferred" : "sendImmediate"}`
        );

        if (options?.mode === "deferred") {
          await sendDeferred({
            notificationId: options.notificationId,
            emails: to,
            content,
          });
        } else {
          await sendImmediate({ emails: to, content });
        }

        return;
      }

      logMessage.debug("Sending email directly through GC Notify");

      await Promise.all(
        to.map((emailAddress) =>
          gcNotifyConnector.sendEmail(emailAddress, content).catch((error) => {
            logMessage.warn(
              `Failed to send email to ${emailAddress} through GC Notify. Reason: ${
                (error as Error).message
              }`
            );
          })
        )
      );
    } catch (error) {
      logMessage.error(
        `Failed to send email to ${to.join(", ")} through GC Notify. Reason: ${
          (error as Error).message
        }`
      );

      throw error;
    }
  });
}
