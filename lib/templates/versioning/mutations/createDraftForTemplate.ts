import { FormRecord } from "@lib/types";
import {
  isTemplateVersioningEnabled,
  templateRecordInclude,
  templateVersionSelect,
} from "../internal/index";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { TEMPLATE_VERSION_STATUS } from "../internal/types";
import { parseTemplate } from "../internal/index";

export async function createDraftVersionForTemplate(formID: string): Promise<FormRecord | null> {
  if (!(await isTemplateVersioningEnabled())) {
    throw new Error("Template versioning is not enabled.");
  }

  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
    );
    throw e;
  });

  const updatedTemplate = await prisma
    .$transaction(async (tx) => {
      const template = await tx.template.findUnique({
        where: {
          id: formID,
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          jsonConfig: true,
          isPublished: true,
          currentPublishedVersionId: true,
          currentDraftVersionId: true,
          deliveryOption: true,
          securityAttribute: true,
          formPurpose: true,
          publishReason: true,
          publishFormType: true,
          publishDesc: true,
          saveAndResume: true,
          notificationsInterval: true,
          currentPublishedVersion: {
            select: templateVersionSelect,
          },
          currentDraftVersion: {
            select: templateVersionSelect,
          },
          versions: {
            select: {
              versionNumber: true,
            },
            orderBy: {
              versionNumber: "desc",
            },
            take: 1,
          },
        },
      });

      // Ensure we have a published version row to base the draft off of.
      // Some templates may have `isPublished` true but no corresponding templateVersion row.
      // In that case, create a published templateVersion first.
      if (!template) return null;

      const existingLatest = template.versions[0]?.versionNumber ?? 0;

      let publishedVersionJson: Prisma.JsonValue | null = null;
      let createdPublishedVersionId: string | null = null;

      if (
        template.isPublished &&
        (!template.currentPublishedVersionId || !template.currentPublishedVersion)
      ) {
        const now = new Date();
        const createdPublished = await tx.templateVersion.create({
          data: {
            templateId: formID,
            versionNumber: existingLatest + 1,
            status: TEMPLATE_VERSION_STATUS.PUBLISHED,
            jsonConfig: template.jsonConfig as Prisma.JsonObject,
            createdByUserId: user.id,
            publishedAt: now,
            publishedByUserId: user.id,
            publishReason: template.publishReason ?? undefined,
          },
          select: {
            id: true,
            jsonConfig: true,
          },
        });

        createdPublishedVersionId = createdPublished.id;
        publishedVersionJson = createdPublished.jsonConfig as Prisma.JsonValue;
      }

      // If a draft already exists return the (possibly updated) template.
      if (template.currentDraftVersion) {
        if (createdPublishedVersionId) {
          return tx.template.update({
            where: { id: formID },
            data: {
              currentPublishedVersionId: createdPublishedVersionId,
            },
            include: templateRecordInclude,
          });
        }

        return template;
      }

      const nextVersionNumber = (existingLatest ?? 0) + (createdPublishedVersionId ? 2 : 1);

      const draftJson = template.currentPublishedVersion
        ? (template.currentPublishedVersion.jsonConfig as Prisma.JsonObject)
        : ((publishedVersionJson as Prisma.JsonObject) ??
          (template.jsonConfig as Prisma.JsonObject));

      const draftVersion = await tx.templateVersion.create({
        data: {
          templateId: formID,
          versionNumber: nextVersionNumber,
          status: TEMPLATE_VERSION_STATUS.DRAFT,
          jsonConfig: draftJson as Prisma.JsonObject,
          createdByUserId: user.id,
        },
        select: {
          id: true,
        },
      });

      const updateData: Record<string, unknown> = {
        currentDraftVersionId: draftVersion.id,
      };

      if (createdPublishedVersionId) {
        updateData.currentPublishedVersionId = createdPublishedVersionId;
      }

      return tx.template.update({
        where: {
          id: formID,
        },
        data: updateData,
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (!updatedTemplate) return null;

  return parseTemplate(updatedTemplate, {
    version: updatedTemplate.currentDraftVersion,
    isPublished: false,
  });
}
