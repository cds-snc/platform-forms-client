import { GCNotifyConnector, type Personalisation } from "@gcforms/connectors";
import { logMessage } from "@lib/logger";
import { notifyCatcher } from "@lib/notifyCatcher";

const gcNotifyConnector = GCNotifyConnector.default(process.env.NOTIFY_API_KEY ?? "");

export const sendEmail = async (email: string, personalisation: Personalisation) => {
  try {
    if (process.env.APP_ENV === "test") {
      logMessage.info("Mock Notify email sent.");
      return;
    }

    if (process.env.APP_ENV === "local") {
      try {
        notifyCatcher(email, personalisation);
      } catch (e) {
        logMessage.error("NotifyCatcher failed to catch the email", e);

        // just log it out
        logMessage.info("Development Notify email sending:", "", { email, personalisation });
        logMessage.info("To: " + email);
        logMessage.info("Subject: " + personalisation.subject);
        logMessage.info("Body: " + personalisation.formResponse);
      }
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
      JSON.stringify({
        level: "error",
        severity: 2,
        msg: `Failed to send email to ${email}.`,
        error: (error as Error).message,
      })
    );

    throw new Error(`Failed to send email to ${email}.`);
  }
};
