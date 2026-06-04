import { FormRecord } from "@lib/types";
import { prisma, prismaErrors } from "@gcforms/database";
import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "../auditLogs";
import { parseTemplate } from "./shared";

/**
 * Get a form template by ID (includes full template information but requires view permission)
 * @param formID ID of form template
 * @returns FormRecord
 */
export async function getFullTemplateByID(
  formID: string,
  allowDeleted?: boolean
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
        include: {
          deliveryOption: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) return null;

    logEvent(user.id, { type: "Form", id: formID }, "ReadForm");

    return parseTemplate(template);
  } catch (e) {
    return null;
  }
}
