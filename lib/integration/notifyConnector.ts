import { NotifyClient } from "notifications-node-client";
import { logMessage } from "@lib/logger";

// TODO: create a type for NotifyClient
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let notifyInstance: any = null;

// For unit and e2e tests
const mockNotify = {
  sendEmail: () => {
    logMessage.info("Mock Notify email sent.");
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
