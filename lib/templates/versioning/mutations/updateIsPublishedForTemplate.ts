import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { deleteDraftFormResponses } from "@lib/vault";
import { TemplateAlreadyPublishedError } from "../../internal/errors";
import { getTemplateVersionState } from "../queries/getTemplateVersionState";
import { getFullTemplateByID } from "../queries/getFullTemplateByID";
import {
  getBuilderVersion,
  getTemplateJsonConfigMirrorData,
  parseTemplate,
  templateRecordInclude,
} from "../internal";
import { TEMPLATE_VERSION_STATUS } from "../internal/types";

export async function updateIsPublishedForTemplate(
  formID: string,
  isPublished: boolean,
  publishReason: string,
  publishFormType: string,
  publishDescription: string
): Promise<FormRecord | null> {
  const newPublishStatus = isPublished;

  const { user } = await authorization.canPublishForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToPublishForm
    );
    throw e;
  });

  const templateVersionState = await getTemplateVersionState(formID);
  const supportsVersionedPublishing = Boolean(
    (templateVersionState?.currentDraftVersionId ||
      templateVersionState?.currentPublishedVersionId) &&
    templateVersionState?.isPublished !== undefined
  );

  if (supportsVersionedPublishing && !newPublishStatus) {
    throw new Error("Unpublishing template versions is not supported.");
  }

  if (
    newPublishStatus &&
    process.env.APP_ENV !== "test" &&
    (!supportsVersionedPublishing || templateVersionState?.isPublished === false)
  ) {
    try {
      await deleteDraftFormResponses(formID);
    } catch (e) {
      if (e instanceof TemplateAlreadyPublishedError) {
        return getFullTemplateByID(formID, false);
      }

      throw e;
    }
  }

  const updatedTemplate = supportsVersionedPublishing
    ? await prisma
        .$transaction(async (tx) => {
          const template = await tx.template.findUnique({
            where: {
              id: formID,
            },
            include: templateRecordInclude,
          });

          if (!template) return null;

          if (!template.currentDraftVersion) {
            return template.isPublished ? template : null;
          }

          const now = new Date();

          if (template.currentPublishedVersionId) {
            await tx.templateVersion.update({
              where: {
                id: template.currentPublishedVersionId,
              },
              data: {
                status: TEMPLATE_VERSION_STATUS.SUPERSEDED,
                supersededAt: now,
              },
            });
          }

          const publishedVersion = await tx.templateVersion.update({
            where: {
              id: template.currentDraftVersion.id,
            },
            data: {
              status: TEMPLATE_VERSION_STATUS.PUBLISHED,
              publishedAt: now,
              publishedByUserId: user.id,
              publishReason,
            },
            select: {
              id: true,
              jsonConfig: true,
            },
          });

          return tx.template.update({
            where: {
              id: formID,
            },
            data: {
              isPublished: true,
              ...getTemplateJsonConfigMirrorData(publishedVersion.jsonConfig as Prisma.JsonObject),
              currentPublishedVersionId: publishedVersion.id,
              currentDraftVersionId: null,
              publishReason,
              publishFormType: publishFormType || template.publishFormType || "",
              publishDesc: publishDescription || template.publishDesc || "",
            },
            include: templateRecordInclude,
          });
        })
        .catch((e) => prismaErrors(e, null))
    : await prisma.template
        .update({
          where: {
            id: formID,
            isPublished: {
              not: newPublishStatus,
            },
          },
          data: {
            isPublished: newPublishStatus,
            publishReason,
            publishFormType,
            publishDesc: publishDescription,
          },
          include: templateRecordInclude,
        })
        .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(user.id, { type: "Form", id: formID }, "PublishForm");

  return parseTemplate(updatedTemplate, {
    version: getBuilderVersion(updatedTemplate),
  });
}
