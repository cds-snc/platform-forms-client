import { logger } from "@lib/logger";
import { formCache } from "./cache";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { PublicFormRecord, SubmissionProperties, FormRecord } from "@lib/types";
import { Prisma } from "@prisma/client";
import { FormConfiguration } from "./types/form-types";
import jwt, { Secret } from "jsonwebtoken";

// Get the submission format by using the form ID
// Returns => json object of the submission details.
async function _getSubmissionTypeByID(formID: string): Promise<SubmissionProperties | null> {
  try {
    const template = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      select: {
        jsonConfig: true,
      },
    });
    if (template?.jsonConfig) {
      return (template.jsonConfig as Prisma.JsonObject as FormConfiguration).submission;
    }

    return null;
  } catch (e) {
    return prismaErrors(e, null);
  }
}

/**
 * Get a form template based on publishing status
 * @param status A boolean indicating the publishing status requested
 * @returns A Public Form Record
 */

async function _getTemplateByStatus(status: boolean): Promise<(PublicFormRecord | undefined)[]> {
  try {
    const templates = (await prisma.template.findMany()).map((template) =>
      _parseTemplate(template)
    );
    const sanitizedResponse = templates.map((template) => onlyIncludePublicProperties(template));
    if (sanitizedResponse && sanitizedResponse?.length > 0) {
      return sanitizedResponse.filter(
        (val) =>
          typeof val !== "undefined" && val !== null && val.formConfig.publishingStatus === status
      );
    }
    return [];
  } catch (e) {
    return prismaErrors(e, []);
  }
}

/**
 * Creates a Form Template record
 * @param config Form Template configuration
 * @returns Form Record or null if creation was not sucessfull.
 */

async function _createTemplate(config: FormConfiguration): Promise<FormRecord | null> {
  try {
    const createdTemplate = _parseTemplate(
      await prisma.template.create({
        data: {
          jsonConfig: config as Prisma.JsonObject,
        },
      })
    );

    const bearerToken = jwt.sign(
      {
        formID: createdTemplate.formID,
      },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1y",
      }
    );
    return _parseTemplate(
      await prisma.template.update({
        where: {
          id: createdTemplate.formID,
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
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
async function _updateTemplate(
  formID: string,
  formConfig: FormConfiguration
): Promise<FormRecord | null> {
  try {
    const updatedTempate = await prisma.template.update({
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
    });
    if (formCache.cacheAvailable) formCache.formID.invalidate(formID);
    return _parseTemplate(updatedTempate);
  } catch (e) {
    return prismaErrors(e, null);
  }
}

/**
 * Deletes a form template
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
async function _deleteTemplate(formID: string): Promise<FormRecord | null> {
  try {
    const deletedTemplate = await prisma.template.delete({
      where: {
        id: formID,
      },
      select: {
        id: true,
        jsonConfig: true,
      },
    });
    if (formCache.cacheAvailable) formCache.formID.invalidate(formID);
    return _parseTemplate(deletedTemplate);
  } catch (e) {
    return prismaErrors(e, null);
  }
}

/**
 * Get all form templates
 * @returns An array of Form Records
 */
async function _getAllTemplates(): Promise<Array<FormRecord>> {
  try {
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        jsonConfig: true,
      },
    });
    return templates.map((template) => _parseTemplate(template));
  } catch (e) {
    return prismaErrors(e, []);
  }
}

/**
 * Get a form template by ID
 * @param formID ID of form template
 * @returns Form Record
 */

async function _getTemplateByID(formID: string): Promise<FormRecord | null> {
  try {
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.formID.check(formID);
      if (cachedValue) {
        return cachedValue;
      }
    }
    const template = await prisma.template.findUnique({
      where: {
        id: formID,
      },
      select: {
        id: true,
        jsonConfig: true,
      },
    });

    // Short circuit the public record filtering if no form record is found
    if (!template) return null;

    const parsedTemplate = _parseTemplate(template);
    if (formCache.cacheAvailable) formCache.formID.set(formID, parsedTemplate);

    return parsedTemplate;
  } catch (e) {
    return prismaErrors(e, null);
  }
}

const _onlyIncludePublicProperties = (template: FormRecord): PublicFormRecord => {
  return {
    formID: template.formID,
    formConfig: {
      publishingStatus: template.formConfig.publishingStatus,
      displayAlphaBanner: template.formConfig.displayAlphaBanner ?? true,
      securityAttribute: template.formConfig.securityAttribute ?? "Unclassified",
      ...(process.env.RECAPTCHA_V3_SITE_KEY && {
        reCaptchaID: process.env.RECAPTCHA_V3_SITE_KEY,
      }),
      form: template.formConfig.form,
    },
  };
};

const _parseTemplate = (template: { id: string; jsonConfig: Prisma.JsonValue }): FormRecord => {
  return {
    formID: template.id,
    // Converting to unknown first as Prisma is not aware of what is stored
    // in the JSON Object type, only that it is an object.
    formConfig: template.jsonConfig as unknown as FormConfiguration,
  };
};

export const createTemplate = logger(_createTemplate);
export const getAllTemplates = logger(_getAllTemplates);
export const getTemplateByID = logger(_getTemplateByID);
export const updateTemplate = logger(_updateTemplate);
export const deleteTemplate = logger(_deleteTemplate);
export const getTemplateByStatus = logger(_getTemplateByStatus);
export const getSubmissionTypeByID = logger(_getSubmissionTypeByID);
export const onlyIncludePublicProperties = logger(_onlyIncludePublicProperties);
