import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "../auditLogs";
import { parseTemplate } from "./shared";

export async function getTemplateWithAssociatedUsers(formID: string): Promise<{
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
        deliveryOption: true,
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
    formRecord: parseTemplate(templateWithAssociatedUsers),
    users: templateWithAssociatedUsers.users,
  };
}
