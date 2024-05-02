import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";
import { AxiosError } from "axios";

// TODO: create a type for NotifyClient
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let notifyInstance: any = null;

// For unit and e2e tests
const mockNotify = {
  sendEmail: () => {
    logMessage.info("Mock Notify email sent.");

    // Returns an example Notify response with sender etc. replaced with generic text
    return {
      id: "740e5834-3a29-46b4-9a6f-16142fde533a",
      reference: "STRING",
      content: {
        subject: "SUBJECT TEXT",
        body: "MESSAGE TEXT",
        from_email: "SENDER EMAIL",
      },
      uri: "https://api.notification.canada.ca/v2/notifications/740e5834-3a29-46b4-9a6f-16142fde533a",
      template: {
        id: "f33517ff-2a88-4f6e-b855-c550268ce08a",
        version: 1,
        uri: "https://api.notification.canada.ca/v2/template/f33517ff-2a88-4f6e-b855-c550268ce08a",
      },
    };
  },
};

const createNotifyInstance = () => {
  if (process.env.APP_ENV === "test") {
    return mockNotify;
  }

  if (!process.env.NOTIFY_API_KEY) {
    throw new Error("No Notify API key configured");
  }

  return new NotifyClient("https://api.notification.canada.ca", process.env.NOTIFY_API_KEY);
};

export const getNotifyInstance = () => {
  if (!notifyInstance) {
    notifyInstance = createNotifyInstance();
  }

  return notifyInstance;
};

export const sendEmail = async (email: string, personalisation: Record<string, string>) => {
  try {
    const templateId = process.env.TEMPLATE_ID;
    if (!templateId) {
      throw new Error("No Notify template ID configured.");
    }

    const notify = getNotifyInstance();
    await notify.sendEmail(templateId, email, { personalisation });
  } catch (error) {
    let errorMessage = "";

    if (error instanceof AxiosError) {
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
        errorMessage = `${error.request}.`;
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
