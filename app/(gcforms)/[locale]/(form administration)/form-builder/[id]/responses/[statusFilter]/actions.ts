"use server";
import { auth } from "@lib/auth";
import { ucfirst } from "@lib/client/clientHelpers";
import { createAbility } from "@lib/privileges";
import { getFullTemplateByID } from "@lib/templates";
import { VaultStatus } from "@lib/types";
import { isResponseId } from "@lib/validation";
import { listAllSubmissions } from "@lib/vault";
import { cache } from "react";

export const fetchTemplate = cache(async (id: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);
  const template = await getFullTemplateByID(ability, id);

  return template;
});

export const fetchSubmissions = async ({
  formId,
  status,
  lastKey,
}: {
  formId: string;
  status: string;
  lastKey?: string;
}) => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);

  // get status from url params (default = new) and capitalize/cast to VaultStatus
  // Protect against invalid status query
  const selectedStatus = Object.values(VaultStatus).includes(ucfirst(status) as VaultStatus)
    ? (ucfirst(status) as VaultStatus)
    : VaultStatus.NEW;

  let currentLastEvaluatedKey = null;

  // build up lastEvaluatedKey from lastKey url param
  if (lastKey && isResponseId(String(lastKey))) {
    currentLastEvaluatedKey = {
      Status: selectedStatus,
      NAME_OR_CONF: `NAME#${lastKey}`,
      FormID: formId,
    };
  }

  const { submissions, lastEvaluatedKey } = await listAllSubmissions(
    ability,
    formId,
    selectedStatus,
    currentLastEvaluatedKey
  );

  return { submissions, lastEvaluatedKey };
};
