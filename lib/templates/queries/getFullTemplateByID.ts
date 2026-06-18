import { FormRecord } from "@lib/types";
import { prisma, prismaErrors } from "@gcforms/database";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { parseTemplate } from "../internal";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { getFullTemplateByID as getFullTemplateByIDVersioningEnabled } from "@lib/templates/versioning/queries/getFullTemplateByID";

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
    if (await isTemplateVersioningEnabled()) {
      return getFullTemplateByIDVersioningEnabled(formID, allowDeleted);
    }

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
          lastEditedBy: {
            select: {
              name: true,
            },
          },
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
