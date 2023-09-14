import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getFullTemplateByID } from "@lib/templates";
import { connectToDynamo } from "@lib/integration/dynamodbConnector";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

const getSubmissions = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const formId = req.query.form;

    if (!formId || typeof formId !== "string") {
      return res.status(400).json({ error: "Bad request" });
    }

    const ability = createAbility(session);
    const fullFormTemplate = await getFullTemplateByID(ability, formId);

    if (fullFormTemplate === null) return res.status(404).json({ error: "Form Not Found" });

    const documentClient = connectToDynamo();
    let queryResult;

    switch (req.method) {
      // Download all responses
      case "GET": {
        try {
          const queryCommand = new QueryCommand({
            TableName: "Vault",
            ExpressionAttributeValues: {
              ":FormID": formId,
              ":name": "NAME#",
            },
            ExpressionAttributeNames: {
              "#name": "Name",
            },
            KeyConditionExpression: "FormID = :FormID AND begins_with(NAME_OR_CONF, :name)",
            ProjectionExpression: "#name, FormSubmission",
          });

          queryResult = await documentClient.send(queryCommand);
          break;
        } catch (err) {
          return res.status(500).json(err);
        }
      }

      // Download specific responses, ids in POST body
      case "POST": {
        const data = req.body;
        const ids = data.ids.split(",");
        const expressionAttributeValues: { [key: string]: string } = {};

        const idParams = ids
          .map((id: string, index: number) => {
            const idParam = `:id${index}`;
            expressionAttributeValues[idParam] = id;
            return idParam;
          })
          .join(",");

        const queryCommand = new QueryCommand({
          TableName: "Vault",
          ExpressionAttributeValues: {
            ":FormID": formId,
            ":name": "NAME#",
            ...expressionAttributeValues,
          },
          ExpressionAttributeNames: {
            "#name": "Name",
          },
          KeyConditionExpression: "FormID = :FormID AND begins_with(NAME_OR_CONF, :name)",
          FilterExpression: `#name IN (${idParams})`,
          ProjectionExpression: "#name, FormSubmission",
        });

        queryResult = await documentClient.send(queryCommand);
        break;
      }
    }

    if (!queryResult)
      return res.status(500).json({ error: "There was an error. Please try again later." });

    const responses = queryResult?.Items?.map((item) => {
      return {
        id: item.Name,
        submission: JSON.parse(item.FormSubmission),
      };
    });

    if (req.query.format) {
      if (req.query.format === "csv") {
        //
      }

      if (req.query.format === "xlsx") {
        //
      }

      if (req.query.format === "html") {
        //
      }
      return res.status(200).json("format requested: " + req.query.format);
    }

    // Default repsonse format is JSON
    return res.status(200).json({ responses: responses });
  } catch (err) {
    return res.status(500).json({ error: err });
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "There was an error. Please try again later." });
  }
};

export default middleware(
  [cors({ allowedMethods: ["GET", "POST"] }), sessionExists()],
  getSubmissions
);
