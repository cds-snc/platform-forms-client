"use server";

import {
  getThrottling,
  setThrottlingExpiry,
  setPermanentThrottling,
  resetThrottling,
} from "@lib/cache/throttlingCache";
import { AuthenticatedAction } from "@lib/actions";
import { ServerActionError } from "@lib/types/form-builder-types";
import { AuditLogDetails, logEvent } from "@lib/auditLogs";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getCurrentThrottlingRate = AuthenticatedAction(async (_, formId: string) => {
  return getThrottling(formId).catch(() => {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  });
});

export const temporarilyIncreaseThrottlingRate = AuthenticatedAction(
  async (session, formId: string, weeks: number) => {
    try {
      await setThrottlingExpiry(formId, weeks);

      logEvent(
        session.user.id,
        { type: "ServiceAccount" },
        "IncreaseThrottlingRate",
        AuditLogDetails.IncreasedThrottling,
        { formId: formId, weeks: weeks.toString(), userId: session.user.id }
      );
    } catch (error) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

export const permanentlyIncreaseThrottlingRate = AuthenticatedAction(
  async (session, formId: string) => {
    try {
      await setPermanentThrottling(formId);

      logEvent(
        session.user.id,
        { type: "ServiceAccount" },
        "IncreaseThrottlingRate",
        AuditLogDetails.PermanentIncreasedThrottling,
        { formId: formId, userId: session.user.id }
      );
    } catch (error) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

export const resetThrottlingRate = AuthenticatedAction(async (session, formId: string) => {
  try {
    await resetThrottling(formId);

    logEvent(
      session.user.id,
      { type: "ServiceAccount" },
      "ResetThrottlingRate",
      AuditLogDetails.ResetThrottling,
      { formId: formId, userId: session.user.id }
    );
  } catch (error) {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});
