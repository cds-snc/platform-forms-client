import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { logger, logMessage } from "@lib/logger";
import {
  CrudOrganizationInput,
  CrudTemplateResponse,
  CrudOrganizationResponse,
  CrudTemplateInput,
  SubmissionProperties,
  PublicFormSchemaProperties,
} from "../types";
import { organizationCache, formCache } from "../cache";

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
});

async function _crudTemplatesWithCache(payload: CrudTemplateInput): Promise<CrudTemplateResponse> {
  const { method, formID } = payload;
  if (formCache.cacheAvailable && method === "GET" && formID) {
    const cachedValue = await formCache.formID.check(formID);
    if (cachedValue) {
      return cachedValue;
    }
  }

  return await _crudTemplates(payload).then((response) => {
    if (formCache.cacheAvailable) {
      switch (method) {
        case "GET":
          if (formID) {
            formCache.formID.set(formID, response);
          }
          break;
        case "POST":
        case "PUT":
        case "DELETE":
          if (formID) {
            formCache.formID.invalidate(formID);
          }
          break;
        default:
          break;
      }
    }

    return response;
  });
}

async function _crudTemplates(payload: CrudTemplateInput): Promise<CrudTemplateResponse> {
  const getConfig = (payload: CrudTemplateInput) => {
    const { method, formID, formConfig } = payload;

    switch (method) {
      case "GET":
        return {
          method: "GET",
          formID,
        };
      case "POST":
        return {
          method: "INSERT",
          formConfig,
        };
      case "PUT":
        return {
          method: "UPDATE",
          formConfig,
          formID,
        };
      case "DELETE":
        return {
          method: "DELETE",
          formID,
        };
      default:
        return {
          method: "UNDEFINED",
        };
    }
  };

  const encoder = new TextEncoder();
  const command = new InvokeCommand({
    FunctionName: process.env.TEMPLATES_API ?? "Templates",
    Payload: encoder.encode(JSON.stringify(getConfig(payload))),
  });
  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const respPayload = decoder.decode(response.Payload);
      if (response.FunctionError) {
        //throw Error("Templates API could not process json");
        // temporary more graceful failure here
        logMessage.debug("Lambda Template Client not successful");
        return null;
      } else {
        logMessage.debug("Lambda Template Client successfully triggered");
        return JSON.parse(respPayload);
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Templates function");
    });
}

// CRUD for Organizations
async function _crudOrganizationsWithCache(
  payload: CrudOrganizationInput
): Promise<CrudOrganizationResponse> {
  if (organizationCache.cacheAvailable && payload.method === "GET" && payload.organizationID) {
    const cachedValue = await organizationCache.organizationID.check(payload.organizationID);
    if (cachedValue) {
      return cachedValue;
    }
  }

  return await _crudOrganizations(payload).then((response) => {
    if (organizationCache.cacheAvailable) {
      switch (payload.method) {
        case "GET":
          if (payload.organizationID) {
            organizationCache.organizationID.set(payload.organizationID, response);
          }
          break;
        case "DELETE":
        case "UPDATE":
        case "INSERT":
          if (payload.organizationID) {
            organizationCache.organizationID.invalidate(payload.organizationID);
          }
          break;
        default:
          break;
      }
    }
    return response;
  });
}

async function _crudOrganizations(
  payload: CrudOrganizationInput
): Promise<CrudOrganizationResponse> {
  const getConfig = (payload: CrudOrganizationInput) => {
    const { method, organizationID, organizationNameEn, organizationNameFr } = payload;

    switch (payload.method) {
      case "GET":
        return {
          method,
          organizationID,
        };
      case "POST":
        return {
          method,
          organizationNameEn,
          organizationNameFr,
        };
      case "PUT":
        return {
          method,
          organizationID,
          organizationNameEn,
          organizationNameFr,
        };
      case "DELETE":
        return {
          method: "DELETE",
          organizationID,
        };
      default:
        return {
          method: "UNDEFINED",
        };
    }
  };

  const lambdaClient = new LambdaClient({
    region: "ca-central-1",
    endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
  });
  const encoder = new TextEncoder();
  const command = new InvokeCommand({
    FunctionName: process.env.ORGANIZATIONS_API ?? "Organizations",
    Payload: encoder.encode(JSON.stringify(getConfig(payload))),
  });

  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const respPayload = decoder.decode(response.Payload);
      if (response.FunctionError) {
        logMessage.debug("Lambda Organizations Client not successful");
        return null;
      } else {
        logMessage.debug("Lambda Organizations Client successfully triggered");
        return JSON.parse(respPayload);
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Organizations function");
    });
}

// Get the submission format by using the form ID
// Returns => json object of the submission details.
async function _getSubmissionByID(formID: string): Promise<SubmissionProperties | null> {
  const response = await crudTemplates({ method: "GET", formID: formID });
  const { records } = response.data;
  if (records?.length === 1 && records[0].formConfig?.submission) {
    return {
      ...records[0].formConfig?.submission,
    };
  }
  return null;
}

async function _getFormByStatus(
  status: boolean
): Promise<(PublicFormSchemaProperties | undefined)[]> {
  const response = await crudTemplates({ method: "GET" });
  const { records } = response.data;
  if (records && records?.length > 0) {
    return records
      .map((record) => {
        if (record.formConfig.publishingStatus === status) {
          return {
            formID: record.formID,
            ...record.formConfig.form,
            publishingStatus: record.formConfig.publishingStatus,
            displayAlphaBanner: record.formConfig.displayAlphaBanner ?? true,
            securityAttribute: record.formConfig.securityAttribute ?? "Unclassified",
          };
        }
      })
      .filter((val) => typeof val !== "undefined" && val !== null);
  }
  return [];
}

async function _getFormByID(formID: string): Promise<PublicFormSchemaProperties | null> {
  try {
    const response = await crudTemplates({ method: "GET", formID: formID });
    const sanitizedResponse = await onlyIncludePublicProperties(response);
    return sanitizedResponse.data[0];
  } catch (e) {
    logMessage.error(e as Error);
    return null;
  }
}

const _onlyIncludePublicProperties = async ({
  data: { records },
}: CrudTemplateResponse): Promise<{ data: Array<PublicFormSchemaProperties> }> => {
  if (records) {
    const sanitizedResponse = records.map((template) => {
      return {
        formID: template.formID,
        publishingStatus: template.formConfig.publishingStatus,
        securityAttribute: template.formConfig.securityAttribute ?? "Unclassified",
        displayAlphaBanner: template.formConfig.displayAlphaBanner ?? true,
        ...(process.env.RECAPTCHA_V3_SITE_KEY && {
          reCaptchaID: process.env.RECAPTCHA_V3_SITE_KEY,
        }),
        ...template.formConfig.form,
      };
    });
    return { data: sanitizedResponse };
  } else {
    throw new Error("No records found");
  }
};

export const crudOrganizations = logger(_crudOrganizationsWithCache);
export const crudTemplates = logger(_crudTemplatesWithCache);
export const getFormByID = logger(_getFormByID);
export const getFormByStatus = logger(_getFormByStatus);
export const getSubmissionByID = logger(_getSubmissionByID);
export const onlyIncludePublicProperties = logger(_onlyIncludePublicProperties);
