import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord, FormProperties } from "@lib/types";
import { parseTemplate, templateRecordInclude } from "../internal";
import { TEMPLATE_VERSION_STATUS } from "../internal/types";
import { UpdateTemplateCommand, UpdateTemplateAction } from "../../types";
import { authorizeForCommand } from "../../mutations/shared/authorizeForCommand";
import { logTemplateUpdateEvent } from "../../mutations/shared/logTemplateUpdateEvent";
import { TemplateAlreadyPublishedError } from "../../internal/errors";
import type { Prisma } from "@gcforms/database";
import { publishTemplate } from "./publishTemplate";
import { buildUpdateQuery, UpdatePlan } from "../../mutations/shared/buildUpdateQuery";
import { validateFormConfig } from "../../mutations/shared/validateFormConfig";

type CurrentTemplate = Prisma.TemplateGetPayload<{
  select: {
    name: true;
    jsonConfig: true;
    isPublished: true;
    currentDraftVersionId: true;
    currentPublishedVersionId: true;
  };
}> | null;

export const executeTemplateUpdate = async (
  updatePlan: UpdatePlan,
  lastEditedByUserId: string,
  currentTemplate: CurrentTemplate
): Promise<FormRecord | null> => {
  let updatedTemplate: Prisma.TemplateGetPayload<{ include: typeof templateRecordInclude }> | null =
    null;

  // When a draft version exists, keep the template row and the draft version's
  // jsonConfig in sync inside one transaction.
  if (currentTemplate?.currentDraftVersionId) {
    updatedTemplate = await prisma
      .$transaction(async (tx) => {
        await tx.templateVersion.update({
          where: {
            id: currentTemplate.currentDraftVersionId!,
          },
          data: { jsonConfig: updatePlan.data.jsonConfig as Prisma.JsonObject },
        });

        return tx.template.update({
          where: {
            id: updatePlan.where.id,
          },
          data: {
            ...updatePlan.data,
            lastEditedBy: { connect: { id: lastEditedByUserId } },
          },
          include: templateRecordInclude,
        });
      })
      .catch((e) => prismaErrors(e, null));
    /* start remove
     * Temporary workaround: support allowed updates on legacy published
     * templates after their initial published snapshot has been backfilled.
     * Remove this once published-template updates no longer need to keep the
     * template row and published version snapshot synchronized here.
     */
  } else if (currentTemplate?.currentPublishedVersionId && currentTemplate.isPublished) {
    // Some updates are still allowed on published templates. If this update
    // changes jsonConfig, keep the published version snapshot aligned with the
    // template row so reads do not diverge.
    updatedTemplate = await prisma
      .$transaction(async (tx) => {
        if (updatePlan.data.jsonConfig !== undefined) {
          await tx.templateVersion.update({
            where: {
              id: currentTemplate.currentPublishedVersionId!,
            },
            data: { jsonConfig: updatePlan.data.jsonConfig as Prisma.JsonObject },
          });
        }

        return tx.template.update({
          where: updatePlan.where,
          data: {
            ...updatePlan.data,
            lastEditedBy: { connect: { id: lastEditedByUserId } },
          },
          include: templateRecordInclude,
        });
      })
      .catch((e) => prismaErrors(e, null));
    /* end remove */
  } else {
    // Templates without version pointers still update the template row directly.
    updatedTemplate = await prisma.template
      .update({
        where: updatePlan.where,
        data: { ...updatePlan.data, lastEditedBy: { connect: { id: lastEditedByUserId } } },
        include: templateRecordInclude,
      })
      .catch((e) => prismaErrors(e, null));
  }

  if (updatedTemplate === null) return null;

  return parseTemplate(updatedTemplate);
};

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
export async function updateTemplate(command: UpdateTemplateCommand): Promise<FormRecord | null> {
  if (command.action === UpdateTemplateAction.IsPublished) {
    return publishTemplate(command);
  }

  const { user } = await authorizeForCommand(command);

  let currentTemplate = await prisma.template.findUnique({
    where: {
      id: command.formId,
    },
    select: {
      name: true,
      jsonConfig: true,
      isPublished: true,
      currentDraftVersionId: true,
      currentPublishedVersionId: true,
    },
  });

  /* start remove
   * Temporary workaround: when template versioning is enabled after a
   * template already exists, that template may not have any
   * `TemplateVersion` rows yet. This block backfills the initial version
   * records so the normal versioned update flow can continue.
   * Remove this once legacy templates have been migrated.
   */

  if (
    currentTemplate &&
    !currentTemplate.currentDraftVersionId &&
    !currentTemplate.currentPublishedVersionId
  ) {
    try {
      await prisma.$transaction(async (tx) => {
        // Read the latest version number so any backfilled records continue the
        // same numbering sequence as existing version rows.
        const templateRecord = await tx.template.findUnique({
          where: { id: command.formId },
          select: {
            jsonConfig: true,
            isPublished: true,
            versions: {
              select: { versionNumber: true },
              orderBy: { versionNumber: "desc" },
              take: 1,
            },
          },
        });

        if (!templateRecord) {
          return;
        }

        const nextVersionNumber = (templateRecord.versions[0]?.versionNumber ?? 0) + 1;

        if (templateRecord.isPublished) {
          // Published legacy templates only need a published snapshot here.
          // Allowed published-form updates can then keep that snapshot and the
          // template row in sync without creating a draft up front.
          const now = new Date();
          const createdPublished = await tx.templateVersion.create({
            data: {
              templateId: command.formId,
              versionNumber: nextVersionNumber,
              status: TEMPLATE_VERSION_STATUS.PUBLISHED,
              jsonConfig: templateRecord.jsonConfig as Prisma.JsonObject,
              createdByUserId: user.id,
              publishedAt: now,
              publishedByUserId: user.id,
            },
            select: { id: true },
          });

          await tx.template.update({
            where: { id: command.formId },
            data: {
              currentPublishedVersionId: createdPublished.id,
            },
          });

          return;
        }

        // Unpublished templates only need an initial draft version.
        const createdDraft = await tx.templateVersion.create({
          data: {
            templateId: command.formId,
            versionNumber: nextVersionNumber,
            status: TEMPLATE_VERSION_STATUS.DRAFT,
            jsonConfig: templateRecord.jsonConfig as Prisma.JsonObject,
            createdByUserId: user.id,
          },
          select: { id: true },
        });

        await tx.template.update({
          where: { id: command.formId },
          data: { currentDraftVersionId: createdDraft.id },
        });
      });
    } catch {
      // Continue with the legacy update path if the initialization attempt fails.
    }

    try {
      // Re-read the template so the update path below sees the version pointers
      // created by the backfill transaction.
      const refreshed = await prisma.template.findUnique({
        where: { id: command.formId },
        select: {
          name: true,
          jsonConfig: true,
          isPublished: true,
          currentDraftVersionId: true,
          currentPublishedVersionId: true,
        },
      });

      if (refreshed) {
        currentTemplate = refreshed;
      }
    } catch {
      // Keep the original template snapshot if refresh fails.
    }
  }

  /* end remove */

  if ("formConfig" in command) {
    await validateFormConfig(command.formConfig, user);
  }

  const updateQuery = buildUpdateQuery(command);
  const updatedTemplate = await executeTemplateUpdate(updateQuery, user.id, currentTemplate);

  if (updatedTemplate === null) {
    throw new TemplateAlreadyPublishedError(
      currentTemplate?.currentPublishedVersionId && currentTemplate.isPublished
        ? "Create a new draft version before editing a published template."
        : undefined
    );
  }

  if (formCache.cacheAvailable) formCache.invalidate(command.formId);

  await logTemplateUpdateEvent({
    action: command.action,
    command,
    user,
    beforeContext: {
      name: currentTemplate?.name,
      jsonConfig: currentTemplate?.jsonConfig as FormProperties,
    },
  });

  return updatedTemplate;
}
