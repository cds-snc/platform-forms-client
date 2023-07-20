import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";

// TODO: create a type for NotifyClient
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let notifyInstance: any = null;

// For unit and e2e tests
const mockNotify = {
  sendEmail: () => {
    logMessage.info("Mock Notify email sent.");

    // Returns an example Notify response with sender etc. replaced with generic text
    return {
      "id": "740e5834-3a29-46b4-9a6f-16142fde533a",
      "reference": "STRING",
      "content": {
        "subject": "SUBJECT TEXT",
        "body": "MESSAGE TEXT",
        "from_email": "SENDER EMAIL"
      },
      "uri": "https://api.notification.canada.ca/v2/notifications/740e5834-3a29-46b4-9a6f-16142fde533a",
      "template": {
        "id": "f33517ff-2a88-4f6e-b855-c550268ce08a",
        "version": 1,
        "uri": "https://api.notification.canada.ca/v2/template/f33517ff-2a88-4f6e-b855-c550268ce08a"
      }
    }
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
