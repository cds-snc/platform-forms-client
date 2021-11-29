import fs from "fs";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { logger, logMessage } from "../logger";
import {
  CrudOrganisationInput,
  CrudTemplateResponse,
  CrudOrganisationResponse,
  CrudTemplateInput,
  SubmissionProperties,
  PublicFormSchemaProperties,
} from "../types";
import { organisationCache, formCache } from "../cache";

const lambdaClient = new LambdaClient({
  region: "ca-central-1",
  retryMode: "standard",
  endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
});

async function _crudTemplatesWithCache(payload: CrudTemplateInput): Promise<CrudTemplateResponse> {
  if (payload.method === "GET" && payload.formID) {
    const cachedValue = await formCache.formID.check(payload.formID);
    if (cachedValue) {
      return cachedValue;
    }
  }

  return await _crudTemplates(payload).then((response) => {
    switch (payload.method) {
      case "GET":
        if (payload.formID) {
          formCache.formID.set(payload.formID, response);
        }
        break;
      case "DELETE":
      case "UPDATE":
      case "INSERT":
        if (payload.formID) {
          formCache.formID.invalidate(payload.formID);
        }
        break;
      default:
        break;
    }

    return response;
  });
}

async function _crudTemplates(payload: CrudTemplateInput): Promise<CrudTemplateResponse> {
  const getConfig = (payload: CrudTemplateInput) => {
    const { method, formID, formConfig } = payload;

    switch (payload.method) {
      case "GET":
        return {
          method,
          formID,
        };
      case "INSERT":
        return {
          method,
          formConfig,
        };
      case "UPDATE":
        return {
          method,
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

  if (process.env.CYPRESS && payload.method !== "GET") {
    logMessage.info("Templates CRUD API in Test Mode");
    const timer = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 1000);
      });
    };

    return timer().then(() => {
      const { method, formConfig } = payload;
      switch (method) {
        case "INSERT":
          return {
            data: {
              records: [
                {
                  formID: "TEST",
                  formConfig: formConfig ?? {
                    publishingStatus: false,
                    submission: {},
                    form: {
                      titleEn: "test",
                      titleFr: "test",
                      layout: [],
                      elements: [],
                    },
                  },
                  organization: false,
                },
              ],
            },
          };
        case "UPDATE":
          return {
            data: {},
          };
        case "DELETE":
          return {
            data: {},
          };
        default:
          return {
            data: {},
          };
      }
    });
  }

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
        logMessage.info("Lambda Template Client not successful");
        return null;
      } else {
        logMessage.info("Lambda Template Client successfully triggered");
        return JSON.parse(respPayload);
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Templates function");
    });
}

// CRUD for Organisations
async function _crudOrganisationsWithCache(
  payload: CrudOrganisationInput
): Promise<CrudOrganisationResponse> {
  if (payload.method === "GET" && payload.organisationID) {
    const cachedValue = await organisationCache.organisationID.check(payload.organisationID);
    if (cachedValue) {
      return cachedValue;
    }
  }

  return await _crudOrganisations(payload).then((response) => {
    switch (payload.method) {
      case "GET":
        if (payload.organisationID) {
          organisationCache.organisationID.set(payload.organisationID, response);
        }
        break;
      case "DELETE":
      case "UPDATE":
      case "INSERT":
        if (payload.organisationID) {
          organisationCache.organisationID.invalidate(payload.organisationID);
        }
        break;
      default:
        break;
    }

    return response;
  });
}

async function _crudOrganisations(
  payload: CrudOrganisationInput
): Promise<CrudOrganisationResponse> {
  const getConfig = (payload: CrudOrganisationInput) => {
    const { method, organisationID, organisationNameEn, organisationNameFr } = payload;

    switch (payload.method) {
      case "GET":
        return {
          method,
          organisationID,
        };
      case "INSERT":
        return {
          method,
          organisationNameEn,
          organisationNameFr,
        };
      case "UPDATE":
        return {
          method,
          organisationID,
          organisationNameEn,
          organisationNameFr,
        };
      case "DELETE":
        return {
          method: "DELETE",
          organisationID,
        };
      default:
        return {
          method: "UNDEFINED",
        };
    }
  };

  if (process.env.CYPRESS && payload.method !== "GET") {
    logMessage.info("Organisations CRUD API in Test Mode");
    const timer = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 1000);
      });
    };

    return timer().then(() => {
      const { method } = payload;
      switch (method) {
        case "INSERT":
          return {
            data: {
              records: [
                {
                  organisationID: "11111111-1111-1111-1111-111111111111",
                  organisationNameEn: "Test",
                  organisationNAmeFr: "Test",
                },
              ],
            },
          };
        case "UPDATE":
          return {
            data: {},
          };
        case "DELETE":
          return {
            data: {},
          };
        default:
          return {
            data: {},
          };
      }
    });
  }

  const lambdaClient = new LambdaClient({
    region: "ca-central-1",
    endpoint: process.env.LOCAL_LAMBDA_ENDPOINT,
  });
  const encoder = new TextEncoder();
  const command = new InvokeCommand({
    FunctionName: process.env.ORGANISATIONS_API ?? "Organisations",
    Payload: encoder.encode(JSON.stringify(getConfig(payload))),
  });

  return await lambdaClient
    .send(command)
    .then((response) => {
      const decoder = new TextDecoder();
      const respPayload = decoder.decode(response.Payload);
      if (response.FunctionError) {
        logMessage.info("Lambda Organisations Client not successful");
        return null;
      } else {
        logMessage.info("Lambda Organisations Client successfully triggered");
        return JSON.parse(respPayload);
      }
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Organisations function");
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
          };
        }
      })
      .filter((val) => typeof val !== "undefined" && val !== null);
  }
  return [];
}

async function _getFormByID(
  formID: string,
  mockedFormFile?: string
): Promise<PublicFormSchemaProperties | null> {
  // for cypress tests we want to return a dummy form from a local file
  // as opposed to needing to hit a staging endpoint
  // additionally we use an environment variable to enable or disable this
  // as in a production setting this could be dangerous as one could potentially
  // error bomb our queue if this is left enabled
  if (mockedFormFile && process.env.ALLOW_MOCK_FORMS) {
    const mockedForm = JSON.parse(
      fs.readFileSync(
        `${__dirname.split("/").slice(0, -5).join("/")}/tests/data/${mockedFormFile}.json`,
        { encoding: "utf8" }
      )
    );
    return mockedForm.form;
  }
  const response = await crudTemplates({ method: "GET", formID: formID });
  const { records } = response.data;
  if (records?.length === 1 && records[0].formConfig.form) {
    return {
      formID,
      ...records[0].formConfig.form,
      publishingStatus: records[0].formConfig.publishingStatus,
      displayAlphaBanner: records[0].formConfig.displayAlphaBanner ?? true,
    };
  }
  return null;
}

export const crudOrganisations = logger(_crudOrganisationsWithCache);
export const crudTemplates = logger(_crudTemplatesWithCache);
export const getFormByID = logger(_getFormByID);
export const getFormByStatus = logger(_getFormByStatus);
export const getSubmissionByID = logger(_getSubmissionByID);
