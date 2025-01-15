"use server";

import {
  getThrottling,
  setThrottlingExpiry,
  setPermanentThrottling,
  resetThrottling,
} from "@lib/cache/throttlingCache";
import { AuthenticatedAction } from "@lib/actions";
import { headers } from "next/headers";
import { ServerActionError } from "@lib/types/form-builder-types";
import { logEvent } from "@lib/auditLogs";

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
        `User :${session.user.id} increased throttling rate on form ${formId} for ${weeks} week(s)`
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
        `User :${session.user.id} permanently increased throttling rate on form ${formId}`
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
      `User :${session.user.id} reset throttling rate on form ${formId}`
    );
  } catch (error) {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
export const getNonce = async () => {
  const nonce = (await headers()).get("x-nonce");
  return nonce;
};
