"use server";

import { VaultStatus } from "@lib/types";
import { isResponseId } from "@lib/validation/validation";
import { listAllSubmissions } from "@lib/vault";
import { logMessage } from "@lib/logger";
import { authCheckAndThrow } from "@lib/actions";

export const fetchSubmissions = async ({
  formId,
  lastKey,
}: {
  formId: string;
  lastKey: string | null;
}) => {
  try {
    const { session, ability } = await authCheckAndThrow().catch(() => ({
      session: null,
      ability: null,
    }));

    if (!session) {
      throw new Error("User is not authenticated");
    }

    if (!formId) {
      return {
        submissions: [],
        lastEvaluatedKey: null,
      };
    }

    let currentLastEvaluatedKey = null;

    // build up lastEvaluatedKey from lastKey url param
    if (lastKey && isResponseId(String(lastKey))) {
      currentLastEvaluatedKey = {
        Status: VaultStatus.CONFIRMED,
        NAME_OR_CONF: `NAME#${lastKey}`,
        FormID: formId,
      };
    }

    const { submissions, lastEvaluatedKey } = await listAllSubmissions(
      ability,
      formId,
      VaultStatus.CONFIRMED,
      undefined,
      currentLastEvaluatedKey
    );

    return { submissions, lastEvaluatedKey };
  } catch (e) {
    logMessage.error(`Error fetching submissions for form ${formId}: ${(e as Error).message}`);
    return { error: true, submissions: [], lastEvaluatedKey: null };
  }
};
