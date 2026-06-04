import { prisma, prismaErrors } from "@gcforms/database";
import { FormProperties } from "@lib/types";
import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "../auditLogs";

export const getFormJSONConfig = async (formId: string) => {
  await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToGetFormJson
    );
    throw e;
  });

  const result = await prisma.template
    .findUnique({
      where: { id: formId },
      select: { jsonConfig: true },
    })
    .catch((e) => prismaErrors(e, null));

  if (!result) {
    throw new Error(`Template not found when getting jsonConfig with formId ${formId}`);
  }

  let jsonConfig: FormProperties;
  const raw = result.jsonConfig;

  if (typeof raw === "string") {
    // Only parse if (unexpectedly) stored as a string
    jsonConfig = JSON.parse(raw) as FormProperties;
  } else {
    jsonConfig = raw as FormProperties;
  }

  return jsonConfig;
};
