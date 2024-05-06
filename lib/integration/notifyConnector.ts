import { logMessage } from "@lib/logger";
import axios from "axios";

const NotifyClient = axios.create({
  baseURL: "https://api.notification.canada.ca",
  timeout: 2000,
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

    const templateId = process.env.TEMPLATE_ID;
    if (!templateId) {
      throw new Error("No Notify template ID configured.");
    }

    await NotifyClient.post("/v2/notifications/email", {
      email_address: email,
      template_id: templateId,
      personalisation,
    });
  } catch (error) {
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
        errorMessage = `Error sending to Notify with request :${JSON.stringify(error.request)}.`;
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

    throw new Error(`Failed to send submission through GC Notify.`);
  }
};
