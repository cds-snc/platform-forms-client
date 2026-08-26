import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { deleteDraftFormResponses } from "@lib/vault";
import { getFullTemplateByID } from "../queries/getFullTemplateByID";
import { TemplateAlreadyPublishedError } from "../internal/errors";
import { parseTemplate } from "../internal";
import { UpdateIsPublishedCommand } from "../types";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { publishTemplate as publishTemplateVersioningEnabled } from "../versioning/mutations/publishTemplate";
import { authorizeForCommand } from "./shared/authorizeForCommand";
import { logTemplateUpdateEvent } from "./shared/logTemplateUpdateEvent";

export async function publishTemplate(
  command: UpdateIsPublishedCommand
): Promise<FormRecord | null> {
  if (await isTemplateVersioningEnabled()) {
    return publishTemplateVersioningEnabled(command);
  }

  const { user } = await authorizeForCommand(command);

  if (command.isPublished && process.env.APP_ENV !== "test") {
    try {
      await deleteDraftFormResponses(command.formId);
    } catch (e) {
      if (e instanceof TemplateAlreadyPublishedError) {
        return getFullTemplateByID(command.formId, false);
      }

      throw e;
    }
  }

  const updatedTemplate = await prisma.template
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
        lastEditedBy: { connect: { id: user.id } },
      },
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

  if (formCache.cacheAvailable) formCache.invalidate(command.formId);

  await logTemplateUpdateEvent({
    action: command.action,
    command,
    user,
  });

  return parseTemplate(updatedTemplate);
}
