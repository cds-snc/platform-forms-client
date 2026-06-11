import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { ClosedDetails } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "@lib/auditLogs";
import { isValidISODate } from "@lib/utils/date/isValidISODate";

export const updateClosedData = async (
  formID: string,
  closingDate: string | null,
  details?: ClosedDetails
) => {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateClosingDate
    );
    throw e;
  });

  let detailsData: ClosedDetails | null = null;

  if (closingDate !== null && !isValidISODate(String(closingDate))) {
    throw new Error(`Invalid ISO date ${closingDate}`);
  }

  // Add the closed details if they exist
  if (details) {
    detailsData = {};
    detailsData.messageEn = details?.messageEn || "";
    detailsData.messageFr = details?.messageFr || "";
  }

  await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        closingDate,
        closedDetails: detailsData !== null ? (detailsData as Prisma.JsonObject) : Prisma.JsonNull,
        lastEditedByUserId: user.id,
      },
      select: {
        id: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  if (closingDate) {
    const date = new Date(closingDate);

    logEvent(
      user.id,
      { type: "Form", id: formID },
      "UpdateForm",
      AuditLogDetails.UpdateClosingDate,
      {
        closingDate: date.toLocaleDateString("en-CA"),
      }
    );
  } else {
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "UpdateForm",
      AuditLogDetails.RemoveClosingDate
    );
  }

  return { formID, closingDate };
};
