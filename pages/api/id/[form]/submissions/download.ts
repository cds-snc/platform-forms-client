import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import type { NextApiRequest, NextApiResponse } from "next";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getFullTemplateByID } from "@lib/templates";
import { connectToDynamo } from "@lib/integration/dynamodbConnector";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { transform as csvTransform } from "@lib/api/submissions/download/transformers/csv";
import { transform as xlsxTransform } from "@lib/api/submissions/download/transformers/xlsx";
import { transform as htmlTableTransform } from "@lib/api/submissions/download/transformers/html-table";

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
            ProjectionExpression: "#name, FormSubmission, CreatedAt, ConfirmationCode",
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
          ProjectionExpression: "#name, FormSubmission, CreatedAt, ConfirmationCode",
        });

        queryResult = await documentClient.send(queryCommand);
        break;
      }
    }

    if (!queryResult)
      return res.status(500).json({ error: "There was an error. Please try again later." });

    const responses = queryResult.Items?.map((item) => {
      const submission = Object.entries(JSON.parse(item.FormSubmission)).map(
        ([questionId, answer]) => {
          const question = fullFormTemplate.form.elements.find(
            (element) => element.id === Number(questionId)
          );
          return {
            questionEn: question?.properties.titleEn,
            questionFr: question?.properties.titleFr,
            answer: Array.isArray(answer) ? answer.join(",") : answer,
          };
        }
      );

      const answers: Record<string, string> = {};

      submission.forEach((answer) => {
        if (answer.questionEn) {
          const key = answer.questionEn;
          answers[key] = answer.answer as string;
        }
      });

      return {
        id: item.Name,
        created_at: item.CreatedAt,
        confirmation_code: item.ConfirmationCode,
        ...answers,
      };
    });

    if (!responses) {
      return res.status(500).json({ error: "There was an error. Please try again later." });
    }

    if (req.query.format) {
      if (req.query.format === "csv") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/csv")
          .setHeader("Content-Disposition", `attachment; filename=records.csv`)
          .send(csvTransform(responses));
      }

      if (req.query.format === "xlsx") {
        return res
          .status(200)
          .setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          )
          .setHeader("Content-Disposition", `attachment; filename=records.xlsx`)
          .send(xlsxTransform(responses));
      }

      if (req.query.format === "html-table") {
        return res
          .status(200)
          .setHeader("Content-Type", "text/html")
          .send(htmlTableTransform(responses));
      }

      return res.status(200).json("format requested: " + req.query.format);
    }

    // Default repsonse format is JSON
    return res.status(200).json({ responses: responses });
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else
      return res
        .status(500)
        .json({ message: "There was an error. Please try again later.", error: err });
  }
};

export default middleware(
  [cors({ allowedMethods: ["GET", "POST"] }), sessionExists()],
  getSubmissions
);
