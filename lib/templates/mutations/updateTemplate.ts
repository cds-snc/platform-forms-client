import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord, FormProperties } from "@lib/types";
import { parseTemplate } from "../internal";
import { TemplateAlreadyPublishedError } from "../internal/errors";
import { UpdateTemplateCommand, UpdateTemplateAction } from "../types";
import { updateTemplate as updateTemplateVersioningEnabled } from "../versioning/mutations/updateTemplate";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { publishTemplate } from "./publishTemplate";
import { authorizeForCommand } from "./shared/authorizeForCommand";
import { logTemplateUpdateEvent } from "./shared/logTemplateUpdateEvent";
import { buildUpdateQuery, UpdatePlan } from "./shared/buildUpdateQuery";
import { validateFormConfig } from "./shared/validateFormConfig";

const executeTemplateUpdate = async (updatePlan: UpdatePlan, lastEditedByUserId: string) => {
  const updatedTemplate = await prisma.template
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

  const templateVersioningEnabled = await isTemplateVersioningEnabled();
  if (templateVersioningEnabled) {
    return updateTemplateVersioningEnabled(command);
  }

  const { user } = await authorizeForCommand(command);

  const currentTemplate = await prisma.template.findUnique({
    where: {
      id: command.formId,
    },
    select: {
      name: true,
      jsonConfig: true,
    },
  });

  if ("formConfig" in command) {
    await validateFormConfig(command.formConfig, user);
  }

  const updateQuery = buildUpdateQuery(command);
  const updatedTemplate = await executeTemplateUpdate(updateQuery, user.id);

  if (updatedTemplate === null && command.action === UpdateTemplateAction.FormConfig) {
    throw new TemplateAlreadyPublishedError();
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
