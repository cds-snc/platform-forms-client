import { v4 as uuid } from "uuid";
import { logMessage } from "./logger";
import { createNotificationRecord, enqueueDeferredNotification } from "@root/packages/core/src";

const sendImmediatedNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: {
  notificationId?: string;
  emails: string[];
  subject: string;
  body: string;
}): Promise<void> => {
  const id = notificationId ?? uuid();
  try {
    await createNotificationRecord({ notificationId: id, emails, subject, body });
    await enqueueDeferredNotification(id!);
    logMessage.info(`Notification created and queued id ${id}`);
  } catch (error) {
    logMessage.warn(
      `Error creating and queueing notification id ${id}: ${(error as Error).message}`
    );
  }
};

const sendDeferredNotification = async ({
  notificationId,
  emails,
  subject,
  body,
}: {
  notificationId: string;
  emails: string[];
  subject: string;
  body: string;
}): Promise<void> => {
  try {
    await createNotificationRecord({ notificationId, emails, subject, body });
    logMessage.info(`Notification created id ${notificationId}`);
  } catch (error) {
    logMessage.warn(
      `Error creating notification id ${notificationId}: ${(error as Error).message}`
    );
  }
};

export const notification = {
  immediate: sendImmediatedNotification,
  deferred: sendDeferredNotification,
};
