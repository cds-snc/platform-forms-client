import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord } from "@lib/types";

import { authorization } from "../../privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "../../auditLogs";
import { logMessage } from "@lib/logger";
import { parseTemplate } from "../internal";

/**
 * Clone a template including associated users and delivery option
 */
export async function cloneTemplate(
  formID: string,
  allowDeleted: boolean,
  locale: string = "en"
): Promise<FormRecord | null> {
  // Ensure the user can create a new form (needed to persist a clone)
  // and that they can edit the source form.
  const [createResult, editResult] = (await Promise.allSettled([
    authorization.canCreateForm(),
    authorization.canEditForm(formID, allowDeleted),
  ])) as Array<PromiseSettledResult<{ user: { id: string } }>>;

  if (createResult.status === "rejected") {
    const e = createResult.reason as { user?: { id?: string } };
    logEvent(
      e?.user?.id ?? "unknown",
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToCloneFormNoCreate
    );
    throw createResult.reason;
  }

  if (editResult.status === "rejected") {
    const e = editResult.reason as { user?: { id?: string } };
    logEvent(
      e?.user?.id ?? "unknown",
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToCloneFormNoEdit
    );
    throw editResult.reason;
  }

  // Extract the user from the fulfilled createResult
  const { user } = (createResult as PromiseFulfilledResult<{ user: { id: string } }>).value;

  const template = await prisma.template
    .findUnique({
      where: { id: formID, ttl: allowDeleted ? { not: null } : null },
      include: {
        deliveryOption: true,
        users: { select: { id: true } },
        notificationsUsers: { select: { id: true } },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!template) {
    logMessage.warn(`[templates][cloneTemplate] Template ${formID} not found`);
    return null;
  }

  const name = locale === "fr" ? `Copie de ${template.name}` : `Copy of ${template.name}`;

  // Build the create payload copying allowed fields. Do NOT copy apiServiceAccount or bearerToken.
  const createData: Prisma.TemplateCreateInput = {
    jsonConfig: template.jsonConfig as Prisma.JsonObject,
    name,
    isPublished: false,
    formPurpose: template.formPurpose,
    publishReason: template.publishReason,
    publishFormType: template.publishFormType,
    publishDesc: template.publishDesc,
    securityAttribute: template.securityAttribute,
    saveAndResume: template.saveAndResume,
    ...(template.notificationsInterval !== undefined && {
      notificationsInterval: template.notificationsInterval,
    }),
    // connect only the current user (owners are not copied when cloning as the form will be a draft form)
    users: {
      connect: [{ id: user.id }],
    },
    // connect current user as a notificationsUser only if they were in the original notificationsUsers list
    ...(template.notificationsUsers &&
      template.notificationsUsers.some((u) => u.id === user.id) && {
        notificationsUsers: {
          connect: [{ id: user.id }],
        },
      }),
    // NOTE: Do NOT copy deliveryOption when cloning - just default to the vault.
  };

  const createdTemplate = await prisma.template
    .create({
      data: createData,
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (createdTemplate === null) return null;

  logEvent(user.id, { type: "Form", id: formID }, "CreateForm", AuditLogDetails.ClonedForm, {
    newFormID: createdTemplate.id,
  });

  return parseTemplate(createdTemplate);
}
