import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { getAbility } from "@lib/privileges";
import { AuditLogDetails, logEvent } from "@lib/auditLogs";
import { logMessage } from "@lib/logger";
import { parseTemplate } from "../internal";

export type TemplateOptions = {
  sortByDateUpdated?: "asc" | "desc";
  requestedWhere?: Prisma.TemplateWhereInput;
};

/**
 * Get all form templates for the User calling the function.
 * @returns An array of Form Records
 */
export async function getAllTemplatesForUser(
  options?: TemplateOptions
): Promise<Array<FormRecord>> {
  try {
    const ability = await getAbility();

    const { sortByDateUpdated, requestedWhere } = options ?? {};
    const templates = await prisma.template
      .findMany({
        where: {
          ...(requestedWhere && requestedWhere),
          users: {
            some: {
              id: ability.user.id,
            },
          },
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          ttl: true,
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
          // only count and not entire user info for privacy etc.
          _count: {
            select: {
              users: true,
              invitations: {
                where: {
                  expires: {
                    // filter out expired invitations (from the past)
                    gt: new Date(),
                  },
                },
              },
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
      logEvent(ability.user.id, { type: "Form" }, "ReadForm", AuditLogDetails.AccessedForms, {
        formList: templates.map((template) => template.id).toString(),
      });

    return templates.map((template) => parseTemplate(template));
  } catch (e) {
    logMessage.error(e);
    return [];
  }
}
