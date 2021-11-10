import * as Constants from "../constant";
import executeQuery from "../integration/queryManager";
import { logMessage } from "../logger";

// prefixed with underscore '_' because 'delete' is a reserved word
const _delete = async (formID) => {
  if (formID) {
    return await executeQuery(Constants.TemplateDeleteQuery, [formID]);
  } else {
    throw new Error("Missing required Parameter: FormID");
  }
};

const create = async (formConfig) => {
  if (formConfig) {
    return await executeQuery(Constants.TemplateInsertQuery, [JSON.stringify(formConfig)]);
  } else {
    throw new Error("Missing required JSON");
  }
};

const update = async (formID, formConfig) => {
  if (formID && formConfig) {
    return await executeQuery(Constants.TemplateUpdateQuery, [formID, JSON.stringify(formConfig)]);
  } else {
    throw new Error("Missing required FormId or JSON");
  }
};
const findOne = async (formID) => {
  if (formID) {
    logMessage.debug(`looking up form id :  ${formID}`);
    return await executeQuery(Constants.TemplateSelectByIdQuery, [formID]);
  } else {
    throw new Error("Missing required FormId");
  }
};
const findTokenByFormID = async (formID) => {
  if (formID) {
    return await executeQuery(Constants.TemplateSelectTokenByFormIdQuery, [formID]);
  } else {
    throw new Error("Missing required FormId");
  }
};

const findAll = async () => {
  return await executeQuery(Constants.TemplateSelectAllQuery, []);
};

export const TemplateDbHelper = {
  findAll,
  findOne,
  create,
  update,
  findTokenByFormID,
  delete: _delete,
};
