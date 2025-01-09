import { logMessage } from "@lib/logger";
import { notifyCatcher } from "@lib/notifyCatcher";

import axios from "axios";

const NotifyClient = axios.create({
  baseURL: "https://api.notification.canada.ca",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `ApiKey-v1 ${process.env.NOTIFY_API_KEY}`,
  },
});

export const sendEmail = async (
  email: string,
  personalisation: Record<string, string | Record<string, string>>
) => {
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

    await NotifyClient.post("/v2/notifications/email", {
      email_address: email,
      template_id: templateId,
      personalisation,
    });

    logMessage.info("HealthCheck: send email success");
  } catch (error) {
    logMessage.info("HealthCheck: send email failure");

    let errorMessage = "";
    if (axios.isAxiosError(error)) {
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        const notifyErrors = Array.isArray(error.response.data.errors)
          ? JSON.stringify(error.response.data.errors)
          : error.response.data.errors;
        errorMessage = `GC Notify errored with status code ${error.response.status} and returned the following detailed errors ${notifyErrors}.`;
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        errorMessage = `Request timed out.`;
      }
    } else if (error instanceof Error) {
      errorMessage = `${(error as Error).message}.`;
    }

    logMessage.error(
      JSON.stringify({
        level: "error",
        severity: 2,
        msg: `Failed to send email through GC Notify to ${email}.`,
        error: errorMessage,
      })
    );

    throw new Error(`Failed to send email through GC Notify.`);
  }
};
