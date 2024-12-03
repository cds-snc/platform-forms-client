import { formCache } from "./cache/formCache";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import {
  PublicFormRecord,
  FormRecord,
  FormProperties,
  DeliveryOption,
  UserAbility,
  SecurityAttribute,
  ClosedDetails,
} from "@lib/types";
import { Prisma } from "@prisma/client";
import { AccessControlError, authorizationCheck } from "./privileges";
import { logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { unprocessedSubmissions, deleteDraftFormResponses } from "./vault";
import { deleteKey } from "./serviceAccount";
import { ownerRemovedEmailTemplate } from "./invitations/emailTemplates/ownerRemovedEmailTemplate";
import { sendEmail } from "./integration/notifyConnector";
import { youHaveBeenRemovedEmailTemplate } from "./invitations/emailTemplates/youHaveBeenRemovedEmailTemplate";
import { ownerAddedEmailTemplate } from "./invitations/emailTemplates/ownerAddedEmailTemplate";
import { isValidISODate } from "./utils/date/isValidISODate";

// ******************************************
// Internal Module Functions
// ******************************************
const _parseTemplate = (template: {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  name: string;
  jsonConfig: Prisma.JsonValue;
  isPublished: boolean;
  deliveryOption: {
    emailAddress: string;
    emailSubjectEn: string | null;
    emailSubjectFr: string | null;
  } | null;
  securityAttribute: string;
  formPurpose: string;
  publishReason: string;
  publishFormType: string;
  publishDesc: string;
  closingDate?: Date | null;
  closedDetails?: Prisma.JsonValue | null;
}): FormRecord => {
  return {
    id: template.id,
    ...(template.created_at && {
      createdAt: template.created_at?.toString(),
    }),
    ...(template.updated_at && {
      updatedAt: template.updated_at.toString(),
    }),
    name: template.name,
    form: template.jsonConfig as FormProperties,
    isPublished: template.isPublished,
    ...(template.deliveryOption && {
      deliveryOption: {
        emailAddress: template.deliveryOption.emailAddress,
        ...(template.deliveryOption.emailSubjectEn && {
          emailSubjectEn: template.deliveryOption.emailSubjectEn,
        }),
        ...(template.deliveryOption.emailSubjectFr && {
          emailSubjectFr: template.deliveryOption.emailSubjectFr,
        }),
      },
    }),
    formPurpose: template.formPurpose,
    publishReason: template.publishReason,
    publishFormType: template.publishFormType,
    publishDesc: template.publishDesc,
    securityAttribute: template.securityAttribute as SecurityAttribute,
    ...(template.closingDate && {
      closingDate: template.closingDate.toString(),
    }),
    closedDetails: template.closedDetails as ClosedDetails,
  };
};

// ******************************************
// Exportable Module Functions
// ******************************************

export type CreateTemplateCommand = {
  ability: UserAbility;
  userID: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: string;
  publishReason?: string;
  publishFormType?: string;
  publishDesc?: string;
};

export type UpdateTemplateCommand = {
  ability: UserAbility;
  formID: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: string;
  publishReason?: string;
  publishFormType?: string;
  publishDesc?: string;
};

export class TemplateAlreadyPublishedError extends Error {
  constructor(message?: string) {
    super(message ?? "TemplateAlreadyPublishedError");
    Object.setPrototypeOf(this, TemplateAlreadyPublishedError.prototype);
  }
}
export class TemplateHasUnprocessedSubmissions extends Error {
  constructor(message?: string) {
    super(message ?? "TemplateHasUnprocessedSubmissions");
    Object.setPrototypeOf(this, TemplateHasUnprocessedSubmissions.prototype);
  }
}

/**
 * Creates a Form Template record
 * @param config Form Template configuration
 * @returns Form Record or null if creation was not sucessfull.
 */
export async function createTemplate(command: CreateTemplateCommand): Promise<FormRecord | null> {
  try {
    await authorizationCheck(command.ability, [
      { action: "create", subject: { type: "FormRecord", scope: "all" } },
    ]);

    const createdTemplate = await prisma.template.create({
      data: {
        jsonConfig: command.formConfig as Prisma.JsonObject,
        ...(command.name && {
          name: command.name,
        }),
        ...(command.deliveryOption && {
          deliveryOption: {
            create: {
              emailAddress: command.deliveryOption.emailAddress,
              emailSubjectEn: command.deliveryOption.emailSubjectEn,
              emailSubjectFr: command.deliveryOption.emailSubjectFr,
            },
          },
        }),
        ...(command.securityAttribute && {
          securityAttribute: command.securityAttribute as string,
        }),
        users: {
          connect: { id: command.userID },
        },
        ...(command.formPurpose && { formPurpose: command.formPurpose }),
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
      },
    });

    logEvent(command.ability.userID, { type: "Form", id: createdTemplate?.id }, "CreateForm");

    return _parseTemplate(createdTemplate);
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        command.ability.userID,
        { type: "Form" },
        "AccessDenied",
        "Attempted to create a Form"
      );
      throw e;
    }

    return prismaErrors(e, null);
  }
}

/**
 * Get all form templates. Must has Manage All Forms privilege.
 * @returns An array of Form Records
 */
export async function getAllTemplates(
  ability: UserAbility,
  options?: {
    requestedWhere?: Prisma.TemplateWhereInput;
    sortByDateUpdated?: "asc" | "desc";
  }
): Promise<Array<FormRecord>> {
  try {
    const { requestedWhere, sortByDateUpdated } = options ?? {};
    // Can a user view any Template
    await authorizationCheck(ability, [
      { action: "view", subject: { type: "FormRecord", scope: "all" } },
    ]);

    const templates = await prisma.template
      .findMany({
        where: {
          ...(requestedWhere && requestedWhere),
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
        },
        ...(sortByDateUpdated && {
          orderBy: {
            updated_at: sortByDateUpdated,
          },
        }),
      })
      .catch((e) => prismaErrors(e, []));

    // Only log the event if templates are found
    if (templates.length > 0)
      logEvent(ability.userID, { type: "Form" }, "ReadForm", "Accessed Forms: All System Forms");

    return templates.map((template) => _parseTemplate(template));
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(ability.userID, { type: "Form" }, "AccessDenied", "Attempted to list all Forms");
      throw e;
    }
    logMessage.error(e);
    return [];
  }
}

export type TemplateOptions = {
  sortByDateUpdated?: "asc" | "desc";
  requestedWhere?: Prisma.TemplateWhereInput;
};

/**
 * Get all form templates for the User calling the function.
 * @returns An array of Form Records
 */
export async function getAllTemplatesForUser(
  ability: UserAbility,
  options?: TemplateOptions
): Promise<Array<FormRecord>> {
  try {
    // We do not need to check the privileges because we are using the user ID from the ability
    // in order to return only templates that the user has ownership on

    const { sortByDateUpdated, requestedWhere } = options ?? {};
    const templates = await prisma.template
      .findMany({
        where: {
          ...(requestedWhere && requestedWhere),
          ttl: null,
          users: {
            some: {
              id: ability.userID,
            },
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
        },
        ...(sortByDateUpdated && {
          orderBy: {
            updated_at: sortByDateUpdated,
          },
        }),
      })
      .catch((e) => prismaErrors(e, []));

    // Only log the event if templates are found
    if (templates.length > 0)
      logEvent(
        ability.userID,
        { type: "Form" },
        "ReadForm",
        `Accessed Forms: ${templates.map((template) => template.id).toString()}`
      );

    return templates.map((template) => _parseTemplate(template));
  } catch (e) {
    logMessage.error(e);
    return [];
  }
}

/**
 * Get a form template by ID (only includes public information but does not require any permission)
 * @param formID ID of form template
 * @returns PublicFormRecord
 */
export async function getPublicTemplateByID(formID: string): Promise<PublicFormRecord | null> {
  try {
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formID);
      if (cachedValue) {
        return cachedValue;
      }
    }

    const template = await prisma.template
      .findUnique({
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
          deliveryOption: true,
          securityAttribute: true,
          formPurpose: true,
          publishReason: true,
          publishFormType: true,
          publishDesc: true,
          closingDate: true,
          closedDetails: true,
          ttl: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    // Short circuit the public record filtering if no form record is found or the form is marked as deleted (ttl != null)
    if (!template || template.ttl) return null;

    const parsedTemplate = _parseTemplate(template);
    const publicFormRecord = onlyIncludePublicProperties(parsedTemplate);

    if (formCache.cacheAvailable) formCache.set(formID, publicFormRecord);

    return publicFormRecord;
  } catch (e) {
    logMessage.error(e);
    return null;
  }
}

/**
 * Get a form template by ID (includes full template information but requires view permission)
 * @param formID ID of form template
 * @returns FormRecord
 */
export async function getFullTemplateByID(
  ability: UserAbility,
  formID: string
): Promise<FormRecord | null> {
  try {
    await authorizationCheck(ability, [
      { action: "view", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    const template = await prisma.template
      .findUnique({
        where: {
          id: formID,
        },
        include: {
          deliveryOption: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) return null;

    logEvent(ability.userID, { type: "Form", id: formID }, "ReadForm");

    return _parseTemplate(template);
  } catch (e) {
    if (e instanceof AccessControlError) {
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attemped to read form object"
      );
      throw e;
    }
    return null;
  }
}

export async function getTemplateWithAssociatedUsers(
  ability: UserAbility,
  formID: string
): Promise<{
  formRecord: FormRecord;
  users: { id: string; name: string | null; email: string }[];
} | null> {
  try {
    await authorizationCheck(ability, [
      { action: "view", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);
    const templateWithAssociatedUsers = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      include: {
        deliveryOption: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!templateWithAssociatedUsers) return null;

    logEvent(
      ability.userID,
      { type: "Form", id: formID },
      "ReadForm",
      "Retrieved users associated with Form"
    );
    return {
      formRecord: _parseTemplate(templateWithAssociatedUsers),
      users: templateWithAssociatedUsers.users,
    };
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to retrieve users associated with Form"
      );

    throw e;
  }
}

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
export async function updateTemplate(command: UpdateTemplateCommand): Promise<FormRecord | null> {
  try {
    await authorizationCheck(command.ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: command.formID } } },
    ]);

    const updatedTemplate = await prisma.template
      .update({
        where: {
          id: command.formID,
          isPublished: false,
        },
        data: {
          jsonConfig: command.formConfig as Prisma.JsonObject,
          name: command.name,
          ...(command.deliveryOption && {
            deliveryOption: {
              upsert: {
                create: {
                  emailAddress: command.deliveryOption.emailAddress,
                  emailSubjectEn: command.deliveryOption.emailSubjectEn,
                  emailSubjectFr: command.deliveryOption.emailSubjectFr,
                },
                update: {
                  emailAddress: command.deliveryOption.emailAddress,
                  emailSubjectEn: command.deliveryOption.emailSubjectEn,
                  emailSubjectFr: command.deliveryOption.emailSubjectFr,
                },
              },
            },
          }),
          ...(command.securityAttribute && {
            securityAttribute: command.securityAttribute as string,
          }),
          ...(command.formPurpose && { formPurpose: command.formPurpose }),
        },
        include: {
          deliveryOption: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (updatedTemplate === null) throw new TemplateAlreadyPublishedError();

    if (formCache.cacheAvailable) formCache.invalidate(command.formID);

    // Log the audit events
    logEvent(
      command.ability.userID,
      { type: "Form", id: command.formID },
      "ChangeFormName",
      `Updated Form name to ${command.name}`
    );
    command.deliveryOption &&
      logEvent(
        command.ability.userID,
        { type: "DeliveryOption", id: command.formID },
        "ChangeDeliveryOption",
        `Change Delivery Option to: ${Object.keys(command.deliveryOption)
          .map((key) => `${key}: ${command.deliveryOption && command.deliveryOption[key]}`)
          .join(", ")}`
      );
    command.securityAttribute &&
      logEvent(
        command.ability.userID,
        { type: "SecurityAttribute", id: command.formID },
        "ChangeSecurityAttribute",
        `Updated security attribute to ${command.securityAttribute}`
      );
    logEvent(
      command.ability.userID,
      { type: "Form", id: command.formID },
      "UpdateForm",
      "Form content updated"
    );

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        command.ability.userID,
        { type: "Form", id: command.formID },
        "AccessDenied",
        "Attempted to update Form"
      );
    throw e;
  }
}

/**
 * Update `isPublished` value for a specific form.
 */
export async function updateIsPublishedForTemplate(
  ability: UserAbility,
  formID: string,
  isPublished: boolean,
  publishReason: string,
  publishFormType: string,
  publishDescription: string
): Promise<FormRecord | null> {
  try {
    await authorizationCheck(ability, [
      {
        action: "update",
        subject: { type: "FormRecord", scope: { subjectId: formID } },
        fields: ["isPublished"],
      },
    ]);

    // We use a where unique input to ensure we are only updating the form if it is not published
    const updatedTemplate = await prisma.template
      .update({
        where: {
          id: formID,
          isPublished: {
            not: isPublished,
          },
        },
        data: {
          isPublished: isPublished,
          publishReason: publishReason,
          publishFormType: publishFormType,
          publishDesc: publishDescription,
        },
        include: {
          deliveryOption: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (updatedTemplate === null) return updatedTemplate;

    // Delete all form responses created during draft mode
    if (isPublished && process.env.APP_ENV !== "test")
      await deleteDraftFormResponses(ability, formID);

    if (formCache.cacheAvailable) formCache.invalidate(formID);

    logEvent(ability.userID, { type: "Form", id: formID }, "PublishForm");

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to publish form"
      );
    throw e;
  }
}

class TemplateNotFoundError extends Error {}
class UserNotFoundError extends Error {}

/**
 * Remove a user from a form
 *
 * @param ability
 * @param formID Form ID
 * @param userID User to be removed ID
 */
export async function removeAssignedUserFromTemplate(
  ability: UserAbility,
  formID: string,
  userID: string
): Promise<void> {
  try {
    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    const template = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      select: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (template === null) {
      logMessage.warn(
        `Can not remove assigned user ${userID} on template ${formID}.  Template does not exist`
      );
      throw new TemplateNotFoundError();
    }

    const userToRemove = template.users.find((user) => user.id === userID);

    if (!userToRemove) {
      logMessage.warn(
        `Can not remove assigned user ${userID} on template ${formID}.  User is not assigned`
      );
      throw new UserNotFoundError();
    }

    const updatedTemplate = await prisma.template
      .update({
        where: {
          id: formID,
        },
        select: {
          jsonConfig: true,
          users: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        data: {
          users: {
            disconnect: {
              id: userID,
            },
          },
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (updatedTemplate === null) return;

    logEvent(
      ability.userID,
      { type: "Form", id: formID },
      "RevokeFormAccess",
      `Access revoked for ${userID}`
    );

    notifyOwnersOwnerRemoved(
      userToRemove,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to remove assigned user for form"
      );
    throw e;
  }
}

/**
 * Assign a user to a form
 *
 * @param ability
 * @param formID
 * @param userID
 */
export async function assignUserToTemplate(
  ability: UserAbility,
  formID: string,
  userID: string
): Promise<void> {
  try {
    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    const template = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      select: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (template === null) {
      logMessage.warn(`Can not add user ${userID} to template ${formID}.  Template does not exist`);
      throw new TemplateNotFoundError();
    }

    const userToAdd = template.users.find((user) => user.id === userID);

    if (!userToAdd) {
      logMessage.warn(`Can not add user ${userID} to template ${formID}.  User does not exist`);
      throw new UserNotFoundError();
    }

    const updatedTemplate = await prisma.template
      .update({
        where: {
          id: formID,
        },
        select: {
          jsonConfig: true,
          users: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        data: {
          users: {
            connect: {
              id: userID,
            },
          },
        },
      })
      .catch((e) => prismaErrors(e, null));

    // No changes
    if (updatedTemplate === null) return;

    logEvent(
      ability.userID,
      { type: "Form", id: formID },
      "GrantFormAccess",
      `Access granted to ${userID}`
    );

    notifyOwnersOwnerAdded(
      userToAdd,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to remove assigned user for form"
      );
    throw e;
  }
}

/**
 * Notify all owners when ownership changes (owner added)
 *
 * @param user New owner
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnersOwnerAdded = async (
  userToAdd: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  const emailContent = ownerAddedEmailTemplate(
    form.titleEn,
    form.titleFr,
    userToAdd.name || userToAdd.email
  );

  users.forEach((owner) => {
    sendEmail(owner.email, {
      subject: "Ownership change notification | Notification de changement de propriété",
      formResponse: emailContent,
    });
  });
};

/**
 * Notify owners of ownership changes (owner removed)
 *
 * @param userToRemove User to be removed
 * @param form Form properties object
 * @param users Current owners
 */
export const notifyOwnersOwnerRemoved = async (
  userToRemove: { name: string | null; email: string },
  form: FormProperties,
  users: { id: string; email: string }[]
) => {
  // Send email to person who was removed
  const youHaveBeenRemovedEmailContent = youHaveBeenRemovedEmailTemplate(
    form.titleEn,
    form.titleFr
  );

  sendEmail(userToRemove.email, {
    subject: "Form access removed | Accès au formulaire supprimé",
    formResponse: youHaveBeenRemovedEmailContent,
  });

  // Send email to remaining owners
  users.forEach((owner) => {
    const ownerRemovedEmailContent = ownerRemovedEmailTemplate(
      form.titleEn,
      form.titleFr,
      userToRemove.name || "An owner"
    );

    sendEmail(owner.email, {
      subject: "Form access removed | Accès au formulaire supprimé",
      formResponse: ownerRemovedEmailContent,
    });
  });
};

/**
 * Add/remove (sync) users to a form
 *
 * @param ability
 * @param formID
 * @param users
 */
export async function updateAssignedUsersForTemplate(
  ability: UserAbility,
  formID: string,
  users: { id: string }[]
): Promise<FormRecord | null> {
  try {
    if (!users.length) throw new Error("No users provided");

    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    const template = await prisma.template.findFirst({
      where: {
        id: formID,
      },
      include: {
        users: true,
      },
    });

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
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (updatedTemplate === null) return updatedTemplate;

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
        ability.userID,
        { type: "Form", id: formID },
        "GrantFormAccess",
        `Access granted to ${usersToAdd.map((user) => user.email ?? user.id).toString()}`
      );

    usersToRemove.length > 0 &&
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "RevokeFormAccess",
        `Access revoked for ${usersToRemove.map((user) => user.email ?? user.id).toString()}`
      );

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to update assigned users for form"
      );
    throw e;
  }
}

/// START HERE TO CONTINUE REFACTORING
export async function updateFormPurpose(
  ability: UserAbility,
  formID: string,
  formPurpose: string
): Promise<FormRecord | null> {
  try {
    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

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
      ability.userID,
      { type: "Form", id: formID },
      "ChangeFormPurpose",
      `Form Purpose set to ${formPurpose}`
    );

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to set Form Purpose"
      );
    throw e;
  }
}

export async function updateResponseDeliveryOption(
  ability: UserAbility,
  formID: string,
  deliveryOption: DeliveryOption
): Promise<FormRecord | null> {
  try {
    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    const updatedTemplate = await prisma.template
      .update({
        where: {
          id: formID,
          isPublished: false,
        },
        data: {
          deliveryOption: {
            upsert: {
              create: {
                emailAddress: deliveryOption.emailAddress,
                emailSubjectEn: deliveryOption.emailSubjectEn,
                emailSubjectFr: deliveryOption.emailSubjectFr,
              },
              update: {
                emailAddress: deliveryOption.emailAddress,
                emailSubjectEn: deliveryOption.emailSubjectEn,
                emailSubjectFr: deliveryOption.emailSubjectFr,
              },
            },
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
      ability.userID,
      { type: "Form", id: formID },
      "ChangeDeliveryOption",
      `Delivery Option set to ${deliveryOption.emailAddress}`
    );

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to set Delivery Option to the Vault"
      );
    throw e;
  }
}

/**
 * Remove DeliveryOption from template. Form responses will be sent to the Vault.
 * @param formID The unique identifier of the form you want to modify
 * @returns The updated form template or null if the record does not exist
 */
export async function removeDeliveryOption(
  ability: UserAbility,
  formID: string
): Promise<FormRecord | null> {
  try {
    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    const updatedTemplate = await prisma.template
      .update({
        where: {
          id: formID,
          isPublished: false,
          deliveryOption: {
            isNot: null,
          },
        },
        data: {
          deliveryOption: {
            delete: true,
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
      ability.userID,
      { type: "Form", id: formID },
      "ChangeDeliveryOption",
      "Delivery Option set to the Vault"
    );

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to set Delivery Option to the Vault"
      );
    throw e;
  }
}

/**
 * Deletes a form template. The template will stay in the database for 30 days in an archived state until a lambda function deletes it from the database.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function deleteTemplate(
  ability: UserAbility,
  formID: string
): Promise<FormRecord | null> {
  try {
    await authorizationCheck(ability, [
      { action: "delete", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

    // Ignore cache (last boolean parameter) because we want to make sure we did not get new submissions while in the flow of deleting a form
    const numOfUnprocessedSubmissions = await unprocessedSubmissions(ability, formID, true);
    if (numOfUnprocessedSubmissions) throw new TemplateHasUnprocessedSubmissions();

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
        },
      })
      .catch((e) => prismaErrors(e, null));

    // There was an error with Prisma, do not delete from Cache.
    if (templateMarkedAsDeleted === null) return templateMarkedAsDeleted;

    logEvent(ability.userID, { type: "Form", id: formID }, "DeleteForm");

    // Check and delete any API keys from IDP
    await deleteKey(formID);

    if (formCache.cacheAvailable) formCache.invalidate(formID);

    return _parseTemplate(templateMarkedAsDeleted);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to delete Form"
      );
    throw e;
  }
}

export const checkUserHasTemplateOwnership = async (ability: UserAbility, formID: string) => {
  await authorizationCheck(ability, [
    { action: "view", subject: { type: "FormRecord", scope: { subjectId: formID } } },
  ]);
};

/*
 * Extract only the public properties from a form record.
 * The public properties are the ones that are needed to display the form
 * to unauthenticated users. (e.g. when filling out a form)
 * Also sets some of the default values for properties that are not set.
 * @param template A Form Record, containing all the properties
 * @returns a Public Form Record, with only the public properties
 */
export const onlyIncludePublicProperties = (template: FormRecord): PublicFormRecord => {
  return {
    id: template.id,
    updatedAt: template.updatedAt,
    closingDate: template.closingDate,
    closedDetails: template.closedDetails,
    form: template.form,
    isPublished: template.isPublished,
    securityAttribute: template.securityAttribute,
  };
};

export const updateClosedData = async (
  ability: UserAbility,
  formID: string,
  closingDate: string | null,
  details?: ClosedDetails
) => {
  await authorizationCheck(ability, [
    { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
  ]);

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

  try {
    await prisma.template
      .update({
        where: {
          id: formID,
        },
        data: {
          closingDate,
          closedDetails:
            detailsData !== null ? (detailsData as Prisma.JsonObject) : Prisma.JsonNull,
        },
        select: {
          id: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (formCache.cacheAvailable) formCache.invalidate(formID);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to update closing date for Form"
      );
    throw e;
  }
  return { formID, closingDate };
};

export const updateSecurityAttribute = async (
  ability: UserAbility,
  formID: string,
  securityAttribute: string
) => {
  try {
    await authorizationCheck(ability, [
      { action: "update", subject: { type: "FormRecord", scope: { subjectId: formID } } },
    ]);

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
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (updatedTemplate === null) return updatedTemplate;

    if (formCache.cacheAvailable) formCache.invalidate(formID);

    logEvent(ability.userID, { type: "Form", id: formID }, "ChangeSecurityAttribute");

    return _parseTemplate(updatedTemplate);
  } catch (e) {
    if (e instanceof AccessControlError)
      logEvent(
        ability.userID,
        { type: "Form", id: formID },
        "AccessDenied",
        "Attempted to update security attribute"
      );
    throw e;
  }
};
