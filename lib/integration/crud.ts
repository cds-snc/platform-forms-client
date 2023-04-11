import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { logger, logMessage } from "@lib/logger";
import { organizationCache, formCache } from "../cache";
import {
  PublicFormRecord,
  TemplateLambdaInput,
  SubmissionProperties,
  OrganizationLambdaInput,
  LambdaResponse,
  FormRecord,
  Organization,
} from "@lib/types";

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
});

async function _crudTemplatesWithCache(
  payload: TemplateLambdaInput
): Promise<LambdaResponse<Omit<FormRecord, "bearerToken">>> {
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

async function _crudTemplates(
  payload: TemplateLambdaInput
): Promise<LambdaResponse<Omit<FormRecord, "bearerToken">>> {
  const getConfig = (payload: TemplateLambdaInput) => {
    const { method, formID, formConfig, limit, offset } = payload;

    switch (method) {
      case "GET":
        return {
          method: "GET",
          formID,
          limit,
          offset,
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
  payload: OrganizationLambdaInput
): Promise<LambdaResponse<Organization>> {
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
  payload: OrganizationLambdaInput
): Promise<LambdaResponse<Organization>> {
  const getConfig = (payload: OrganizationLambdaInput) => {
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
async function _getSubmissionByID(formID: number): Promise<SubmissionProperties | null> {
  const response = await crudTemplates({ method: "GET", formID: formID });
  const { records } = response.data;
  if (records?.length === 1 && records[0].formConfig?.submission) {
    return {
      ...records[0].formConfig?.submission,
    };
  }
  return null;
}

async function _getFormByStatus(status: boolean): Promise<(PublicFormRecord | undefined)[]> {
  const response = await _getForms();
  const sanitizedResponse = onlyIncludePublicProperties(response);
  if (sanitizedResponse && sanitizedResponse?.length > 0) {
    return sanitizedResponse.filter(
      (val) =>
        typeof val !== "undefined" && val !== null && val.formConfig.publishingStatus === status
    );
  }
  return [];
}

/**
 * Recursively calls lambda function to retrieve the forms (templates) from the database
 * @param templates the array which the records will be added to, then recursively passed to the next `getForms()` call
 * @param limit the number of records to fetch from the database
 * @param offset the record to start from
 * @returns an array of all the forms (templates) from the database
 */

const _getForms = async (
  templates: LambdaResponse<Omit<FormRecord, "bearerToken">> = {
    data: {
      records: [],
    },
  },
  limit = 50,
  offset = 0
): Promise<LambdaResponse<Omit<FormRecord, "bearerToken">>> => {
  try {
    const lambdaResult = await crudTemplates({ method: "GET", limit: limit, offset: offset });

    if (!lambdaResult?.data?.records) {
      return templates;
    }

    if (templates.data.records) {
      templates.data.records = templates.data.records.concat(lambdaResult.data.records);
    } else {
      templates = {
        data: {
          records: [...lambdaResult.data.records],
        },
      };
    }

    if (lambdaResult.data.records.length === limit) {
      // There could be more records in the database, so get the next batch
      return await _getForms(templates, limit, offset + limit);
    } else {
      return templates;
    }
  } catch (e) {
    logMessage.error(e as Error);
    return templates;
  }
};

async function _getFormByID(formID: number): Promise<PublicFormRecord | null> {
  try {
    const response = await crudTemplates({ method: "GET", formID: formID });
    const sanitizedResponse = onlyIncludePublicProperties(response);
    return sanitizedResponse[0];
  } catch (e) {
    logMessage.error(e as Error);
    return null;
  }
}

const _onlyIncludePublicProperties = ({
  data: { records },
}: LambdaResponse<Omit<FormRecord, "bearerToken">>): Array<PublicFormRecord> => {
  if (records) {
    return records.map((template) => {
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
    });
  } else {
    throw new Error("No records found");
  }
};

export const crudOrganizations = logger(_crudOrganizationsWithCache);
export const crudTemplates = logger(_crudTemplatesWithCache);
export const getForms = logger(_getForms);
export const getFormByID = logger(_getFormByID);
export const getFormByStatus = logger(_getFormByStatus);
export const getSubmissionByID = logger(_getSubmissionByID);
export const onlyIncludePublicProperties = logger(_onlyIncludePublicProperties);
