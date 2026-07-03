import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "@lib/auditLogs";
import { parseTemplate } from "../internal";
import { logMessage } from "@lib/logger";

/**
 * Get all form templates. Must has Manage All Forms privilege.
 * @returns An array of Form Records
 */
export async function getAllTemplates(options?: {
  requestedWhere?: Prisma.TemplateWhereInput;
  sortByDateUpdated?: "asc" | "desc";
}): Promise<Array<FormRecord>> {
  try {
    const { requestedWhere, sortByDateUpdated } = options ?? {};
    // Can a user view any Template
    const { user } = await authorization.canViewAllForms().catch((e) => {
      logEvent(
        e.user.id,
        { type: "Form" },
        "AccessDenied",
        AuditLogAccessDeniedDetails.AccessDenied_AttempttoAccessAllSystemForms
      );
      throw e;
    });

    const templates = await prisma.template
      .findMany({
        where: {
          ...(requestedWhere && requestedWhere),
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          jsonConfig: true,
          isPublished: true,
          deliveryOption: true,
          securityAttribute: true,
          formPurpose: true,
          publishReason: true,
          publishFormType: true,
          publishDesc: true,
          saveAndResume: true,
          notificationsInterval: true,
          lastEditedBy: {
            select: {
              name: true,
            },
          },
        },
        ...(sortByDateUpdated && {
          orderBy: {
            updated_at: sortByDateUpdated,
          },
        }),
      })
      .catch((e) => prismaErrors(e, []));

    // Only log the event if templates are found
    if (templates.length > 0)
      logEvent(user.id, { type: "Form" }, "ReadForm", AuditLogDetails.AccessedAllSystemForms);

    return templates.map((template) => parseTemplate(template));
  } catch (e) {
    logMessage.error(e);
    return [];
  }
}
