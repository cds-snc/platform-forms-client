import { logger } from "@lib/logger";
import { formCache } from "./cache/formCache";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { PublicFormRecord, SubmissionProperties, FormRecord, BetterOmit } from "@lib/types";
import { Prisma, User } from "@prisma/client";
import jwt, { Secret } from "jsonwebtoken";
import { checkPrivileges, checkPrivilegesAsBoolean } from "./privileges";
import { MongoAbility } from "@casl/ability";

/**
 * Creates a Form Template record
 * @param config Form Template configuration
 * @returns Form Record or null if creation was not sucessfull.
 */
async function _createTemplate(
  ability: MongoAbility,
  userID: string,
  config: BetterOmit<FormRecord, "id">
): Promise<FormRecord | null> {
  try {
    checkPrivileges(ability, [{ action: "create", subject: "FormRecord" }]);

    const createdTemplate = _parseTemplate(
      await prisma.template.create({
        data: {
          jsonConfig: config as Prisma.JsonObject,
          users: {
            connect: { id: userID },
          },
        },
      })
    );

    const bearerToken = jwt.sign(
      {
        formID: createdTemplate.id,
      },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1y",
      }
    );

    return _parseTemplate(
      await prisma.template.update({
        where: {
          id: createdTemplate.id,
        },
        data: {
          bearerToken,
        },
        select: {
          id: true,
          jsonConfig: true,
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
        jsonConfig: true,
      },
    })
    .catch((e) => prismaErrors(e, []));

  return templates.map((template) => _parseTemplate(template));
}

/**
 * Get a form template by ID
 * @param formID ID of form template
 * @returns Form Record
 */
async function _getTemplateByID(formID: string): Promise<FormRecord | null> {
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
        jsonConfig: true,
        ttl: true,
        users: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  // Short circuit the public record filtering if no form record is found or the form is marked as deleted (ttl != null)
  if (!template || template.ttl) return null;

  const parsedTemplate = _parseTemplate(template);

  if (formCache.cacheAvailable) formCache.formID.set(formID, parsedTemplate);

  return parsedTemplate;
}

// Get the submission format by using the form ID
// Returns => json object of the submission details.
async function _getTemplateSubmissionTypeByID(
  formID: string
): Promise<SubmissionProperties | null> {
  return _getTemplateByID(formID).then((formRecord) => formRecord?.submission ?? null);
}

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
async function _updateTemplate(
  ability: MongoAbility,
  formID: string,
  formConfig: BetterOmit<FormRecord, "id" | "bearerToken">
): Promise<FormRecord | null> {
  const formRecordWithAssociatedUsers = await _getFormRecordWithAssociatedUsers(formID);
  if (!formRecordWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "update",
      subject: {
        type: "FormRecord",
        object: {
          ...formRecordWithAssociatedUsers.formRecord,
          users: formRecordWithAssociatedUsers.users,
        },
      },
    },
  ]);

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        jsonConfig: formConfig as Prisma.JsonObject,
      },
      select: {
        id: true,
        jsonConfig: true,
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
  const formRecordWithAssociatedUsers = await _getFormRecordWithAssociatedUsers(formID);
  if (!formRecordWithAssociatedUsers) return null;

  checkPrivileges(ability, [
    {
      action: "delete",
      subject: {
        type: "FormRecord",
        object: {
          ...formRecordWithAssociatedUsers.formRecord,
          users: formRecordWithAssociatedUsers.users,
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
        jsonConfig: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedAsDeleted === null) return templateMarkedAsDeleted;

  if (formCache.cacheAvailable) formCache.formID.invalidate(formID);

  return _parseTemplate(templateMarkedAsDeleted);
}

async function _getFormRecordWithAssociatedUsers(
  formID: string
): Promise<{ formRecord: FormRecord; users: User[] } | null> {
  try {
    const templateWithUsers = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      select: {
        id: true,
        jsonConfig: true,
        users: true,
      },
    });
    if (!templateWithUsers) return null;

    const parsedTemplate = _parseTemplate(templateWithUsers);

    return { formRecord: parsedTemplate, users: templateWithUsers.users };
  } catch (e) {
    return prismaErrors(e, null);
  }
}

export const getTemplateOwners = logger(async (formID: string) => {
  return await prisma.template.findUnique({
    where: {
      id: formID,
    },
    select: {
      users: {
        select: {
          id: true,
        },
      },
    },
  });
});

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

    publishingStatus: template.publishingStatus,
    displayAlphaBanner: template.displayAlphaBanner ?? true,
    securityAttribute: template.securityAttribute ?? "Unclassified",
    ...(process.env.RECAPTCHA_V3_SITE_KEY && {
      reCaptchaID: process.env.RECAPTCHA_V3_SITE_KEY,
    }),
    form: template.form,
  };
};

const _parseTemplate = (template: { id: string; jsonConfig: Prisma.JsonValue }): FormRecord => {
  return {
    id: template.id,
    // Converting to unknown first as Prisma is not aware of what is stored
    // in the JSON Object type, only that it is an object.
    ...(template.jsonConfig as unknown as BetterOmit<
      FormRecord,
      "id" | "reCaptchaID" | "bearerToken"
    >),
    ...(process.env.RECAPTCHA_V3_SITE_KEY && {
      reCaptchaID: process.env.RECAPTCHA_V3_SITE_KEY,
    }),
  };
};

export const createTemplate = logger(_createTemplate);
export const getAllTemplates = logger(_getAllTemplates);
export const getTemplateByID = logger(_getTemplateByID);
export const getTemplateSubmissionTypeByID = logger(_getTemplateSubmissionTypeByID);
export const updateTemplate = logger(_updateTemplate);
export const deleteTemplate = logger(_deleteTemplate);
export const onlyIncludePublicProperties = logger(_onlyIncludePublicProperties);
