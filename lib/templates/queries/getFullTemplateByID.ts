import { FormRecord } from "@lib/types";
import { prisma, prismaErrors } from "@gcforms/database";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { getBuilderVersion, parseTemplate, templateRecordInclude } from "../internal";

export async function getFullTemplateByID(
  formID: string,
  allowDeleted?: boolean,
  versionNumber?: number
): Promise<FormRecord | null> {
  try {
    const { user } = await authorization.canViewForm(formID, allowDeleted).catch((e) => {
      logEvent(
        e.user.id,
        { type: "Form", id: formID },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttemptedToReadFormObject
      );
      throw e;
    });

    const template = await prisma.template
      .findUnique({
        where: {
          id: formID,
          ttl: allowDeleted ? { not: null } : null,
        },
        include: templateRecordInclude,
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) return null;

    const requestedVersion = versionNumber
      ? await prisma.templateVersion
          .findFirst({
            where: {
              templateId: formID,
              versionNumber,
            },
            select: {
              id: true,
              versionNumber: true,
              status: true,
              jsonConfig: true,
            },
          })
          .catch((e) => prismaErrors(e, null))
      : null;

    if (versionNumber && !requestedVersion) return null;

    logEvent(user.id, { type: "Form", id: formID }, "ReadForm");

    return parseTemplate(template, {
      version: requestedVersion ?? getBuilderVersion(template),
    });
  } catch {
    return null;
  }
}
