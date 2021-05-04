const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
import { logMessage } from "../../lib/logger";å

const templates = async (req, res) => {
  try {
    callLambda(req, res);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const callLambda = async (req, res) => {
  const lambdaClient = new LambdaClient({ region: "ca-central-1" });
  const command = new InvokeCommand({
    FunctionName: process.env.TEMPLATES_API ?? "",
    Payload: JSON.stringify({
      templateID: req.templateID,
    }),
  });

  return await lambdaClient
    .send(command)
    .then((response) => {
      return res.status(200).json(response);
    })
    .catch((err) => {
      logMessage.error(err);
      throw new Error("Could not process request with Lambda Templates function");
    });
};

export default templates;
