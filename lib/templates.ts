import { formCache } from "./cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord, FormProperties, ClosedDetails } from "@lib/types";

import { authorization } from "./privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, AuditLogEvent, logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { unprocessedSubmissions } from "./vault";
import { deleteKey } from "./serviceAccount";

import { isValidISODate } from "./utils/date/isValidISODate";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { dateHasPast } from "@lib/utils";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { invalidateTemplateEditLockUserCountCache } from "./editLocks";

/**
 * Add/remove (sync) users to a form
 *
 * @param ability
 * @param formID
 * @param users
 */
export async function updateAssignedUsersForTemplate(
  formID: string,
  users: { id: string }[]
): Promise<FormRecord | null> {
  if (!users.length) throw new Error("No users provided");
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetAssignedUsers
    );
    throw e;
  });

  const template = await prisma.template
    .findFirst({
      where: {
        id: formID,
      },
      include: {
        users: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (template === null) {
    logMessage.warn(
      `Can not update assigned users ${JSON.stringify(
        users
      )} on template ${formID}.  Template does not exist`
    );
    return null;
  }

  const previouslyAssigned =
    template?.users.map((user) => {
      return { id: user.id };
    }) || [];

  const toAdd = users.filter((n) => !previouslyAssigned.some((n2) => n.id == n2.id));
  const toRemove = previouslyAssigned.filter((n) => !users.some((n2) => n.id == n2.id));

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        users: {
          connect: toAdd,
          disconnect: toRemove,
        },
      },
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
        users: true,
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  await invalidateTemplateEditLockUserCountCache(formID);

  const getUsersFromUserIds = (userIds: string[]) => {
    return Promise.all(
      userIds.map((userId) => {
        return prisma.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
        });
      })
    );
  };

  const usersToAdd = await getUsersFromUserIds(toAdd.map((u) => u.id));

  usersToAdd.forEach((user) => {
    notifyOwnersOwnerAdded(
      user,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );
  });

  const usersToRemove = await getUsersFromUserIds(toRemove.map((u) => u.id));

  usersToRemove.forEach((user) => {
    notifyOwnersOwnerRemoved(
      user,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );
  });

  usersToAdd.length > 0 &&
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "GrantFormAccess",
      AuditLogDetails.AccessGrantedTo,
      { userList: usersToAdd.map((user) => user.email ?? user.id).toString() }
    );

  usersToRemove.length > 0 &&
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "RevokeFormAccess",
      AuditLogDetails.AccessRevokedFor,
      { userList: usersToRemove.map((user) => user.email ?? user.id).toString() }
    );

  return _parseTemplate(updatedTemplate);
}

export async function updateFormPurpose(
  formID: string,
  formPurpose: string
): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetFormPurpose
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: false,
      },
      data: {
        formPurpose: formPurpose,
      },
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
        publishDesc: true,
        publishFormType: true,
        publishReason: true,
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new TemplateAlreadyPublishedError();
        }
      }
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    "ChangeFormPurpose",
    AuditLogDetails.SetFormPurpose,
    { formPurpose: formPurpose }
  );

  return _parseTemplate(updatedTemplate);
}

export async function updateFormSaveAndResume(
  formID: string,
  saveAndResume: boolean
): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetSaveAndResume
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        saveAndResume: saveAndResume ?? false,
      },
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
        publishDesc: true,
        publishFormType: true,
        publishReason: true,
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => {
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeFormSaveAndResume,
    AuditLogDetails.SetSaveAndResume,
    { saveAndResume: saveAndResume ? "On" : "Off" }
  );

  return _parseTemplate(updatedTemplate);
}

/**
 * Remove DeliveryOption from template. Form responses will be sent to the Vault.
 * @param formID The unique identifier of the form you want to modify
 * @returns void
 */
export async function removeDeliveryOption(formID: string): Promise<void> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetDeliveryToVault
    );
    throw e;
  });

  // Don't change delivery option if the form is published
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
    },
    select: {
      isPublished: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  if (template.isPublished) throw new TemplateAlreadyPublishedError();

  await prisma.deliveryOption.deleteMany({
    where: {
      templateId: formID,
    },
  });

  logEvent(
    user.id,
    { type: "Form", id: formID },
    "ChangeDeliveryOption",
    AuditLogDetails.SetDeliveryToVault
  );
}

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

  return _parseTemplate(createdTemplate);
}

/**
 * Deletes a form template. The template will stay in the database for 30 days in an archived state until a lambda function deletes it from the database.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function deleteTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canDeleteForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToDeleteForm
    );
    throw e;
  });

  // Check if the form is draft or not.
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
    },
    select: {
      isPublished: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  // Only check submissions if the form is published.
  if (template.isPublished) {
    // Ignore cache (last boolean parameter) because we want to make sure we did not get new submissions while in the flow of deleting a form
    const numOfUnprocessedSubmissions = await unprocessedSubmissions(formID, true);
    if (numOfUnprocessedSubmissions) throw new TemplateHasUnprocessedSubmissions();
  }

  // Check and delete any API keys from IDP
  await deleteKey(formID);

  const dateIn30Days = new Date(Date.now() + 2592000000); // 30 days = 60 (seconds) * 60 (minutes) * 24 (hours) * 30 (days) * 1000 (to ms)
  const templateMarkedAsDeleted = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        ttl: dateIn30Days,
      },
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

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedAsDeleted === null) return templateMarkedAsDeleted;

  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.DeleteForm);

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  return _parseTemplate(templateMarkedAsDeleted);
}

/**
 * Restores a form template from the archived state.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function restoreTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canRestoreForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUnarchiveForm
    );
    throw e;
  });

  // Check if the form is archived.
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
      ttl: { not: null },
    },
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
      ttl: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  const templateMarkedToUnarchive = await prisma.template
    .update({
      where: {
        id: formID,
        ttl: { not: null },
      },
      data: {
        ttl: null,
      },
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

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedToUnarchive === null) return templateMarkedToUnarchive;

  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.UnarchiveForm);

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  return _parseTemplate(templateMarkedToUnarchive);
}

// Remove and replace this utility with new authorization object in code
export const checkUserHasTemplateOwnership = async (formID: string) => {
  await authorization.canEditForm(formID);
};

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

export const updateSecurityAttribute = async (formID: string, securityAttribute: string) => {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateSecurityAttribute
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: false,
      },
      data: { securityAttribute },
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

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeSecurityAttribute,
    AuditLogDetails.ChangeSecurityAttribute,
    { securityAttribute: securityAttribute ?? "" }
  );

  return _parseTemplate(updatedTemplate);
};

export const checkIfClosed = async (formId: string) => {
  try {
    let isPastClosingDate = false;
    let template = null;

    // The form cache stores the public template information
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formId);
      if (cachedValue) {
        template = cachedValue;
      }
    }

    // If the template is not in the cache, we need to fetch it from the database
    if (!template) {
      template = await prisma.template
        .findUnique({
          where: {
            id: formId,
          },
          select: {
            closingDate: true,
            closedDetails: true,
          },
        })
        .catch((e) => prismaErrors(e, null));
    }
    // If it's not in the cache and in the DB then it doesn't exist
    if (!template) {
      throw new Error("Template not found");
    }

    if (template.closingDate) {
      isPastClosingDate = dateHasPast(Date.parse(String(template.closingDate)));
    }

    return {
      isPastClosingDate,
      closedDetails: template.closedDetails as ClosedDetails,
    };
  } catch (e) {
    return null;
  }
};

export const getFormJSONConfig = async (formId: string) => {
  await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToGetFormJson
    );
    throw e;
  });

  const result = await prisma.template
    .findUnique({
      where: { id: formId },
      select: { jsonConfig: true },
    })
    .catch((e) => prismaErrors(e, null));

  if (!result) {
    throw new Error(`Template not found when getting jsonConfig with formId ${formId}`);
  }

  let jsonConfig: FormProperties;
  const raw = result.jsonConfig;

  if (typeof raw === "string") {
    // Only parse if (unexpectedly) stored as a string
    jsonConfig = JSON.parse(raw) as FormProperties;
  } else {
    jsonConfig = raw as FormProperties;
  }

  return jsonConfig;
};

/**
 * WARNING:
 * Avoid using this function for any update that would modify the structure of the form
 * e.g. groups, layouts, elements, etc.
 * Doing so would cause an error in the infra pipeline when processing submissions.
 */
export const updateFormBranding = async (formId: string, jsonConfig: FormProperties) => {
  const { user } = await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateFormJson
    );
    throw e;
  });

  const validationResult = validateTemplate(jsonConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(jsonConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(jsonConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        jsonConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formId,
      },
      data: { jsonConfig: jsonConfig as Prisma.JsonObject },
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

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formId);

  const brandName = jsonConfig.brand?.name ?? "gc";
  logEvent(
    user.id,
    { type: "Form", id: formId },
    AuditLogEvent.UpdateFormBranding,
    AuditLogDetails.UpdateFormBranding,
    { brand: brandName }
  );

  return _parseTemplate(updatedTemplate);
};
