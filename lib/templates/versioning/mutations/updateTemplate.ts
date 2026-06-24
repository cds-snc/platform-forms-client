import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord, FormProperties } from "@lib/types";
import { parseTemplate } from "../internal";
import { getFullTemplateByID } from "../../queries/getFullTemplateByID";
import { deleteDraftFormResponses } from "@lib/vault";
import { UpdateTemplateCommand, UpdateTemplateAction } from "../../types";

import {
  authorizeForCommand,
  buildUpdateQuery,
  logTemplateUpdateEvent,
  UpdatePlan,
  validateFormConfig,
} from "../../mutations/updateTemplate";
import { TemplateAlreadyPublishedError } from "../../internal/errors";
import type { Prisma } from "@gcforms/database";

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
) => {
  let updatedTemplate;

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
          include: {
            deliveryOption: true,
            lastEditedBy: {
              select: {
                name: true,
              },
            },
          },
        });
      })
      .catch((e) => prismaErrors(e, null));
  } else {
    updatedTemplate = await prisma.template
      .update({
        where: updatePlan.where,
        data: { ...updatePlan.data, lastEditedBy: { connect: { id: lastEditedByUserId } } },
        include: {
          deliveryOption: true,
          lastEditedBy: {
            select: {
              name: true,
            },
          },
        },
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
  const { user } = await authorizeForCommand(command);

  const currentTemplate = await prisma.template.findUnique({
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

  if ("formConfig" in command) {
    await validateFormConfig(command.formConfig, user);
  }

  if (command.action === UpdateTemplateAction.IsPublished && command.isPublished) {
    if (process.env.APP_ENV !== "test") {
      try {
        await deleteDraftFormResponses(command.formId);
      } catch (e) {
        if (e instanceof TemplateAlreadyPublishedError) {
          // preserve old behavior if needed
          return getFullTemplateByID(command.formId, false);
        }
        throw e;
      }
    }
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
