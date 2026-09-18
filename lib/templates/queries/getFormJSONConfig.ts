import { prisma, prismaErrors } from "@gcforms/database";
import { FormProperties } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";

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
      select: {
        jsonConfig: true,
        currentDraftVersion: {
          select: {
            jsonConfig: true,
          },
        },
        currentPublishedVersion: {
          select: {
            jsonConfig: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!result) {
    throw new Error(`Template not found when getting jsonConfig with formId ${formId}`);
  }

  const raw =
    result.currentDraftVersion?.jsonConfig ??
    result.currentPublishedVersion?.jsonConfig ??
    result.jsonConfig;

  if (typeof raw === "string") {
    return JSON.parse(raw) as FormProperties;
  }

  return raw as FormProperties;
};
