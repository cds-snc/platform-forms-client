import { prisma } from "./integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { AdminLogAction, AdminLogEvent } from "@lib/types";

/**
 * Logs usage of privileged functions by admins
 * @param adminSession
 * @param action
 * @param event
 * @param description
 */
export const logAdminActivity = async (
  userId: string,
  action: AdminLogAction,
  event: AdminLogEvent,
  description: string
): Promise<void> => {
  try {
    await prisma.adminLog.create({
      data: {
        userId,
        action,
        event,
        description,
      },
    });
  } catch (error) {
    logMessage.error(error as Error);
  }
};
