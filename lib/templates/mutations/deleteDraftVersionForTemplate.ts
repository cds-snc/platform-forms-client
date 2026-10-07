import { prisma, prismaErrors } from "@gcforms/database";
import { authorization } from "@lib/privileges";
import { formCache } from "@lib/cache/formCache";
import { AuditLogEvent, logEvent } from "@lib/auditLogs";

/**
 * Deletes the active draft version without archiving its published parent template.
 */
export async function deleteDraftVersionForTemplate(formID: string): Promise<boolean> {
  const { user } = await authorization.canDeleteForm(formID);

  const deleted = await prisma
    .$transaction(async (tx) => {
      const template = await tx.template.findUnique({
        where: { id: formID },
        select: {
          isPublished: true,
          currentDraftVersionId: true,
        },
      });

      if (!template?.isPublished || !template.currentDraftVersionId) {
        return false;
      }

      await tx.template.update({
        where: { id: formID },
        data: {
          currentDraftVersionId: null,
          lastEditedByUserId: user.id,
        },
      });

      await tx.templateVersion.delete({
        where: { id: template.currentDraftVersionId },
      });

      return true;
    })
    .catch((error) => prismaErrors(error, null));

  if (!deleted) return false;

  if (formCache.cacheAvailable) formCache.invalidate(formID);
  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.DeleteDraftVersion);

  return true;
}
