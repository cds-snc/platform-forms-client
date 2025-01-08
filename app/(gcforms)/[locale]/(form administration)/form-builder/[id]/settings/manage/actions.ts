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

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getCurrentThrottlingRate = AuthenticatedAction(async (_, formId: string) => {
  return getThrottling(formId).catch(() => {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  });
});

export const temporarilyIncreaseThrottlingRate = AuthenticatedAction(
  async (_, formId: string, weeks: number) => {
    return setThrottlingExpiry(formId, weeks).catch(() => {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    });
  }
);

export const permanentlyIncreaseThrottlingRate = AuthenticatedAction(async (_, formId: string) => {
  return setPermanentThrottling(formId).catch(() => {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  });
});

export const resetThrottlingRate = AuthenticatedAction(async (_, formId: string) => {
  return resetThrottling(formId).catch(() => {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  });
});

// Can throw because it is not called by Client Components
// @todo Should these types of functions be moved to a different file?
export const getNonce = async () => {
  const nonce = (await headers()).get("x-nonce");
  return nonce;
};
