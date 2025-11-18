import { GCNotifyConnector, type Personalisation } from "@gcforms/connectors";
import { logMessage } from "@lib/logger";
import { traceFunction } from "../otel";
const gcNotifyConnector = GCNotifyConnector.default(process.env.NOTIFY_API_KEY ?? "");

export const sendEmail = async (email: string, personalisation: Personalisation, type: string) => {
  return traceFunction("sendEmail", async () => {
    try {
      if (process.env.APP_ENV === "test") {
        logMessage.info("Mock Notify email sent.");
        return;
      }

      const templateId = process.env.TEMPLATE_ID;
      if (!templateId) {
        throw new Error("No Notify template ID configured.");
      }

      await gcNotifyConnector.sendEmail(email, templateId, personalisation);

      logMessage.info("HealthCheck: send email success");
    } catch (error) {
      logMessage.info("HealthCheck: send email failure");

      logMessage.error(
        `Failed to send ${type} email to ${email} through GC Notify. Reason: ${
          (error as Error).message
        }`
      );

      throw error;
    }
  });
};
