import { prisma } from "./integration/prismaConnector";
import { logMessage } from "@lib/logger";

export enum AdminLogAction {
  Create = "Create",
  Read = "Read",
  Update = "Update",
  Delete = "Delete",
}

export enum AdminLogEvent {
  GrantAdminRole = "GrantAdminRole",
  RevokeAdminRole = "RevokeAdminRole",
  UploadForm = "UploadForm",
  UpdateForm = "UpdateForm",
  DeleteForm = "DeleteForm",
  RefreshBearerToken = "RefreshBearerToken",
  GrantInitialFormAccess = "GrantInitialFormAccess",
  GrantFormAccess = "GrantFormAccess",
  RevokeFormAccess = "RevokeFormAccess",
  EnableFeature = "EnableFeature",
  DisableFeature = "DisableFeature",
}

type AdminLogActionStrings = keyof typeof AdminLogAction;
type AdminLogEventStrings = keyof typeof AdminLogEvent;

/**
 * Logs usage of privileged functions by admins
 * @param adminSession
 * @param action
 * @param event
 * @param description
 */
export const logAdminActivity = async (
  userId: string,
  action: AdminLogActionStrings,
  event: AdminLogEventStrings,
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
