import dbConnector from "@lib/integration/dbConnector";
import executeQuery from "@lib/integration/queryManager";
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
    await executeQuery(
      await dbConnector(),
      "INSERT INTO admin_logs (user_id, action, event, description) VALUES ($1, $2, $3, $4)",
      [userId, action, event, description]
    );
  } catch (error) {
    logMessage.error(error as Error);
  }
};
