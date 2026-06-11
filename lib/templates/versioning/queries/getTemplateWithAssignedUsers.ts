import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "@lib/auditLogs";
import { templateRecordInclude, getBuilderVersion, parseTemplate } from "../internal";

export async function getTemplateWithAssignedUsers(formID: string): Promise<{
  formRecord: FormRecord;
  users: { id: string; name: string | null; email: string }[];
} | null> {
  const { user } = await authorization.canViewForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToListAssignedUsers
    );
    throw e;
  });
  const templateWithAssociatedUsers = await prisma.template
    .findUnique({
      where: {
        id: formID,
      },
      include: {
        ...templateRecordInclude,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!templateWithAssociatedUsers) return null;

  logEvent(user.id, { type: "Form", id: formID }, "ReadForm", AuditLogDetails.RetrieveFormUsers);
  return {
    formRecord: parseTemplate(templateWithAssociatedUsers, {
      version: getBuilderVersion(templateWithAssociatedUsers),
      isPublished: templateWithAssociatedUsers.currentDraftVersion ? false : undefined,
    }),
    users: templateWithAssociatedUsers.users,
  };
}
