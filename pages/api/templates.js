const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import { logMessage } from "../../lib/logger";

// handler

const templates = async (req, res) => {
  let result;
  if (req.method === "POST") {
    result = handlePostTemplate(req.body);
  } else if (req.method === "GET") {
    result = getTemplates(req.body);
  }
  return res.status(200).json(result);
};

// Lambda API functions:
// GET, INSERT, UPDATE, DELETE

const handlePostTemplate = async (body) => {
  // Handles INSERT, UPDATE, DELETE
  let payload;
  body = JSON.parse(body);
  switch (body.method) {
    case "INSERT":
      payload = {
        method: "INSERT",
        json_config: JSON.parse(body.json_config),
        formID: parseInt(body.formID),
      };
      break;
    case "UPDATE":
      payload = {
        method: "UPDATE",
        json_config: JSON.parse(body.json_config),
      };
      break;
    case "DELETE":
      payload = {
        method: "DELETE",
        formID: parseInt(body.formID),
      }
      break;
    default:
      // TODO - throw error
      break;
  }
  if (payload) return await invokeLambda(payload);
};

const getTemplates = async (formID) => {
  const payload = {
    method: "GET",
    formID: formID || undefined,
  };
  return await invokeLambda(payload);
};

export const invokeLambda = async (payload) => {
  const lambdaClient = new LambdaClient({ region: "ca-central-1" });

  // TODO - default value for env var - do we still need the if statement below?
  const command = new InvokeCommand({
    FunctionName: process.env.TEMPLATES_API ?? "",
    Payload: JSON.stringify(payload),
  });

  if (process.env.TEMPLATES_API) {
    return await lambdaClient
      .send(command)
      .then((response) => {
        let decoder = new TextDecoder();
        const respPayload = decoder.decode(response.Payload);
        if (response.FunctionError) {
          //throw Error("Templates API could not process json");
          // temporary more graceful failure here
          logMessage.info("Lambda Client not successful");
          return null;
        } else {
          logMessage.info("Lambda Client successfully triggered");
          return respPayload;
        }
      })
      .catch((err) => {
        logMessage.error(err);
        throw new Error("Could not process request with Lambda Templates function");
      });
  }
};

export default templates;
