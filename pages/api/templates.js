const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import { logMessage } from "../../lib/logger";

// handler

const templates = async (req, res) => {
  if (req.method === "POST") {
    handleUploadTemplate(req.body);
  } else {
    res.status(200).json({ true: "true" });
  }
};

// Lambda API functions:
// GET, INSERT, UPDATE, DELETE
const handleUploadTemplate = async (json_config) => {
  // hit api endpoint
  const payload = {
    method: "INSERT", // todo - update, delete
    json_config: JSON.parse(json_config),
  };
  return await invokeLambda(payload);
};

/*const getTemplates = async () => {
  const payload = {
    method: "GET",
  };
  invokeLambda(payload);
};*/

export const invokeLambda = async (payload) => {
  const lambdaClient = new LambdaClient({ region: "ca-central-1" });

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
          throw Error("Templates API could not process json");
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
