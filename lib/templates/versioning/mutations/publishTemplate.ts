import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord } from "@lib/types";
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
import { UpdateIsPublishedCommand } from "../../types";
import { authorizeForCommand } from "../../mutations/shared/authorizeForCommand";
import { logTemplateUpdateEvent } from "../../mutations/shared/logTemplateUpdateEvent";

export async function publishTemplate(
  command: UpdateIsPublishedCommand
): Promise<FormRecord | null> {
  const { user } = await authorizeForCommand(command);

  const templateVersionState = await getTemplateVersionState(command.formId);
  const supportsVersionedPublishing = Boolean(
    (templateVersionState?.currentDraftVersionId ||
      templateVersionState?.currentPublishedVersionId) &&
    templateVersionState?.isPublished !== undefined
  );

  if (supportsVersionedPublishing && !command.isPublished) {
    throw new Error("Unpublishing template versions is not supported.");
  }

  if (
    command.isPublished &&
    process.env.APP_ENV !== "test" &&
    (!supportsVersionedPublishing || templateVersionState?.isPublished === false)
  ) {
    try {
      await deleteDraftFormResponses(command.formId);
    } catch (e) {
      if (e instanceof TemplateAlreadyPublishedError) {
        return getFullTemplateByID(command.formId, false);
      }

      throw e;
    }
  }

  const updatedTemplate = supportsVersionedPublishing
    ? await prisma
        .$transaction(async (tx) => {
          const template = await tx.template.findUnique({
            where: {
              id: command.formId,
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
              publishReason: command.publishReason,
            },
            select: {
              id: true,
              jsonConfig: true,
            },
          });

          return tx.template.update({
            where: {
              id: command.formId,
            },
            data: {
              isPublished: true,
              ...getTemplateJsonConfigMirrorData(publishedVersion.jsonConfig as Prisma.JsonObject),
              currentPublishedVersionId: publishedVersion.id,
              currentDraftVersionId: null,
              publishReason: command.publishReason,
              publishFormType: command.publishFormType || template.publishFormType || "",
              publishDesc: command.publishDescription || template.publishDesc || "",
            },
            include: templateRecordInclude,
          });
        })
        .catch((e) => prismaErrors(e, null))
    : await prisma.template
        .update({
          where: {
            id: command.formId,
            isPublished: {
              not: command.isPublished,
            },
          },
          data: {
            isPublished: command.isPublished,
            publishReason: command.publishReason,
            publishFormType: command.publishFormType,
            publishDesc: command.publishDescription,
          },
          include: templateRecordInclude,
        })
        .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(command.formId);

  await logTemplateUpdateEvent({
    action: command.action,
    command,
    user,
    isRepublish: Boolean(templateVersionState?.currentPublishedVersionId),
  });

  return parseTemplate(updatedTemplate, {
    version: getBuilderVersion(updatedTemplate),
  });
}
