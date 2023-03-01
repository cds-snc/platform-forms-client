import { logger } from "@lib/logger";
import { formCache } from "./cache/formCache";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import {
  PublicFormRecord,
  FormRecord,
  FormProperties,
  DeliveryOption,
  UserAbility,
} from "@lib/types";
import { Prisma } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import { checkPrivileges, checkPrivilegesAsBoolean } from "./privileges";
import { MongoAbility } from "@casl/ability";

export class TemplateAlreadyPublishedError extends Error {}

/**
 * Creates a Form Template record
 * @param config Form Template configuration
 * @returns Form Record or null if creation was not sucessfull.
 */
async function _createTemplate(
  ability: MongoAbility,
  userID: string,
  formConfig: FormProperties,
  name?: string,
  deliveryOption?: DeliveryOption
): Promise<FormRecord | null> {
  try {
    checkPrivileges(ability, [{ action: "create", subject: "FormRecord" }]);

    const createdTemplateId = await prisma.template.create({
      data: {
        jsonConfig: formConfig as Prisma.JsonObject,
        ...(name && {
          name: name,
        }),
        ...(deliveryOption && {
          deliveryOption: {
            create: {
              emailAddress: deliveryOption.emailAddress,
              emailSubjectEn: deliveryOption.emailSubjectEn,
              emailSubjectFr: deliveryOption.emailSubjectFr,
            },
          },
        }),
        users: {
          connect: { id: userID },
        },
      },
      select: {
        id: true,
      },
    });

    const bearerToken = jwt.sign(
      {
        formID: createdTemplateId.id,
      },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1y",
      }
    );

    return _parseTemplate(
      await prisma.template.update({
        where: {
          id: createdTemplateId.id,
        },
        data: {
          bearerToken,
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
        },
      })
    );
  } catch (e) {
    return prismaErrors(e, null);
  }
}

/**
 * Get all form templates. Depending on the user permissions the function will return either all or a subset of templates.
 * @returns An array of Form Records
 */
async function _getAllTemplates(ability: MongoAbility, userID: string): Promise<Array<FormRecord>> {
  checkPrivileges(ability, [{ action: "view", subject: "FormRecord" }]);

  const canUserAccessAllTemplates = checkPrivilegesAsBoolean(ability, [
    {
      action: "view",
      subject: {
        type: "FormRecord",
        // Passing an empty object here just to force CASL evaluate the condition part of a permission.
        object: {},
      },
    },
  ]);

  const templates = await prisma.template
    .findMany({
      where: {
        ttl: null,
        ...(!canUserAccessAllTemplates && {
          users: {
            some: {
              id: userID,
            },
          },
        }),
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
      },
    })
    .catch((e) => prismaErrors(e, []));

  return templates.map((template) => _parseTemplate(template));
}

/**
 * Get a form template by ID (no permission required) for internal use only.
 * @param formID ID of form template
 * @returns FormRecord
 */
async function _unprotectedGetTemplateByID(formID: string): Promise<FormRecord | null> {
  if (formCache.cacheAvailable) {
    // This value will always be the latest if it exists because
    // the cache is invalidated on change of a template
    const cachedValue = await formCache.formID.check(formID);
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
        ttl: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  // Short circuit the public record filtering if no form record is found or the form is marked as deleted (ttl != null)
  if (!template || template.ttl) return null;

  const parsedTemplate = _parseTemplate(template);

  if (formCache.cacheAvailable) formCache.formID.set(formID, parsedTemplate);

  return parsedTemplate;
}

/**
 * Get a form template by ID (only includes public information but does not require any permission)
 * @param formID ID of form template
 * @returns PublicFormRecord
 */
async function _getPublicTemplateByID(formID: string): Promise<PublicFormRecord | null> {
  const formRecord = await _unprotectedGetTemplateByID(formID);
  return formRecord ? _onlyIncludePublicProperties(formRecord) : null;
}

/**
 * Get a form template by ID (includes full template information but requires view permission)
 * @param formID ID of form template
 * @returns FormRecord
 */
async function _getFullTemplateByID(
  ability: MongoAbility,
  formID: string
): Promise<FormRecord | null> {
  const templateWithAssociatedUsers = await _unprotectedGetTemplateWithAssociatedUsers(formID);
  if (!templateWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "view",
      subject: {
        type: "FormRecord",
        object: {
          ...templateWithAssociatedUsers.formRecord,
          users: templateWithAssociatedUsers.users,
        },
      },
    },
  ]);

  return templateWithAssociatedUsers.formRecord;
}

// Get the delivery option object for a specific form using the form ID
// Returns => DeliveryOption object.
async function _getTemplateDeliveryOptionByID(formID: string): Promise<DeliveryOption | null> {
  return _unprotectedGetTemplateByID(formID).then(
    (formRecord) => formRecord?.deliveryOption ?? null
  );
}

/**
 * This function is for internal use only since it does not require any permission.
 * There is an exported version `_getTemplateWithAssociatedUsers` that checks for permissions.
 */
async function _unprotectedGetTemplateWithAssociatedUsers(
  formID: string
): Promise<{ formRecord: FormRecord; users: { id: string; name: string | null }[] } | null> {
  const templateWithUsers = await prisma.template
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
        ttl: true,
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (!templateWithUsers || templateWithUsers.ttl) return null;

  const parsedTemplate = _parseTemplate(templateWithUsers);

  return {
    formRecord: parsedTemplate,
    users: templateWithUsers.users,
  };
}

async function _getTemplateWithAssociatedUsers(
  ability: MongoAbility,
  formID: string
): Promise<{ formRecord: FormRecord; users: { id: string; name: string | null }[] } | null> {
  checkPrivileges(ability, [
    {
      action: "view",
      subject: {
        type: "FormRecord",
        // We want to make sure the user has the permission to view all templates
        object: {},
      },
    },
    { action: "view", subject: "User" },
  ]);

  return _unprotectedGetTemplateWithAssociatedUsers(formID);
}

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
async function _updateTemplate(
  ability: MongoAbility,
  formID: string,
  formConfig: FormProperties,
  name?: string,
  deliveryOption?: DeliveryOption
): Promise<FormRecord | null> {
  const templateWithAssociatedUsers = await _unprotectedGetTemplateWithAssociatedUsers(formID);
  if (!templateWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "update",
      subject: {
        type: "FormRecord",
        object: {
          ...templateWithAssociatedUsers.formRecord,
          users: templateWithAssociatedUsers.users,
        },
      },
    },
  ]);

  // Prevent already published templates from being updated
  if (templateWithAssociatedUsers.formRecord.isPublished) throw new TemplateAlreadyPublishedError();

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        jsonConfig: formConfig as Prisma.JsonObject,
        ...(name && {
          name: name,
        }),
        ...(deliveryOption && {
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
        }),
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
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.formID.invalidate(formID);
  return _parseTemplate(updatedTemplate);
}

/**
 * Update `isPublished` value for a specific form.
 */
async function _updateIsPublishedForTemplate(
  ability: MongoAbility,
  formID: string,
  isPublished: boolean
): Promise<FormRecord | null> {
  const templateWithAssociatedUsers = await _unprotectedGetTemplateWithAssociatedUsers(formID);
  if (!templateWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "update",
      subject: {
        type: "FormRecord",
        object: {
          ...templateWithAssociatedUsers.formRecord,
          users: templateWithAssociatedUsers.users,
        },
      },
      field: "isPublished",
    },
  ]);

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: { isPublished },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.formID.invalidate(formID);

  return _parseTemplate(updatedTemplate);
}

async function _updateAssignedUsersForTemplate(
  ability: MongoAbility,
  formID: string,
  users: { id: string; action: "add" | "remove" }[]
): Promise<FormRecord | null> {
  checkPrivileges(ability, [
    { action: "update", subject: "FormRecord" },
    { action: "update", subject: "User" },
  ]);

  const { addUsers, removeUsers } = users.reduce(
    (acc, current) => {
      if (current.action === "add")
        return { ...acc, addUsers: acc.addUsers.concat({ id: current.id }) };
      else return { ...acc, removeUsers: acc.removeUsers.concat({ id: current.id }) };
    },
    {
      addUsers: Array<{ id: string }>(),
      removeUsers: Array<{ id: string }>(),
    }
  );

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        users: {
          connect: addUsers,
          disconnect: removeUsers,
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
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.formID.invalidate(formID);

  return _parseTemplate(updatedTemplate);
}

/**
 * Remove DeliveryOption from template. Form responses will be sent to the Vault.
 * @param formID The unique identifier of the form you want to modify
 * @returns The updated form template or null if the record does not exist
 */
async function _removeDeliveryOption(
  ability: MongoAbility,
  formID: string
): Promise<FormRecord | null> {
  const templateWithAssociatedUsers = await _unprotectedGetTemplateWithAssociatedUsers(formID);
  if (!templateWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "update",
      subject: {
        type: "FormRecord",
        object: {
          ...templateWithAssociatedUsers.formRecord,
          users: templateWithAssociatedUsers.users,
        },
      },
    },
  ]);

  // Prevent already published templates from being updated
  if (templateWithAssociatedUsers.formRecord.isPublished) throw new TemplateAlreadyPublishedError();

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
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
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.formID.invalidate(formID);
  return _parseTemplate(updatedTemplate);
}

/**
 * Deletes a form template. The template will stay in the database for 30 days in an archived state until a lambda function deletes it from the database.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
async function _deleteTemplate(ability: MongoAbility, formID: string): Promise<FormRecord | null> {
  const templateWithAssociatedUsers = await _unprotectedGetTemplateWithAssociatedUsers(formID);
  if (!templateWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "delete",
      subject: {
        type: "FormRecord",
        object: {
          ...templateWithAssociatedUsers.formRecord,
          users: templateWithAssociatedUsers.users,
        },
      },
    },
  ]);

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
      },
    })
    .catch((e) => prismaErrors(e, null));

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedAsDeleted === null) return templateMarkedAsDeleted;

  if (formCache.cacheAvailable) formCache.formID.invalidate(formID);

  return _parseTemplate(templateMarkedAsDeleted);
}

/*
 * Extract only the public properties from a form record.
 * The public properties are the ones that are needed to display the form
 * to unauthenticated users. (e.g. when filling out a form)
 * Also sets some of the default values for properties that are not set.
 * @param template A Form Record, containing all the properties
 * @returns a Public Form Record, with only the public properties
 */
const _onlyIncludePublicProperties = (template: FormRecord): PublicFormRecord => {
  return {
    id: template.id,
    updatedAt: template.updatedAt,
    form: template.form,
    isPublished: template.isPublished,
    securityAttribute: template.securityAttribute,
    ...(process.env.RECAPTCHA_V3_SITE_KEY && {
      reCaptchaID: process.env.RECAPTCHA_V3_SITE_KEY,
    }),
  };
};

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
    securityAttribute: template.securityAttribute,
    ...(process.env.RECAPTCHA_V3_SITE_KEY && {
      reCaptchaID: process.env.RECAPTCHA_V3_SITE_KEY,
    }),
  };
};

export const createTemplate = logger(_createTemplate);
export const getAllTemplates = logger(_getAllTemplates);
export const getPublicTemplateByID = logger(_getPublicTemplateByID);
export const getFullTemplateByID = logger(_getFullTemplateByID);
export const getTemplateDeliveryOptionByID = logger(_getTemplateDeliveryOptionByID);
export const getTemplateWithAssociatedUsers = logger(_getTemplateWithAssociatedUsers);
export const updateTemplate = logger(_updateTemplate);
export const updateIsPublishedForTemplate = logger(_updateIsPublishedForTemplate);
export const updateAssignedUsersForTemplate = logger(_updateAssignedUsersForTemplate);
export const removeDeliveryOption = logger(_removeDeliveryOption);
export const deleteTemplate = logger(_deleteTemplate);
export const onlyIncludePublicProperties = logger(_onlyIncludePublicProperties);
