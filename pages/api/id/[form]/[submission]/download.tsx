import { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { FormRecord, MiddlewareProps, WithRequired } from "@lib/types";

import { AccessControlError, createAbility } from "@lib/privileges";
import React from "react";
import { renderToStaticNodeStream } from "react-dom/server";
import { getFullTemplateByID } from "@lib/templates";

/**
 * Handler for the retrieval API route. This function simply calls the relevant function depending on the HTTP method
 * @param req - The HTTP request object
 * @param res - The HTTP response object
 */

const allowedMethods = ["GET"];

const handler = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  const formID = req.query.form;
  const submissionID = req.query.submission;

  const { session } = props as WithRequired<MiddlewareProps, "session">;

  if (Array.isArray(formID) || !formID) return res.status(400).json({ error: "Bad Request" });

  try {
    const formTemplate = await getFullTemplateByID(createAbility(session.user.privileges), formID);

    if (formTemplate === null) return res.status(404).json({ error: "Form Not Found" });

    const documentClient = connectToDynamo();

    const getItemsDbParams: QueryCommandInput = {
      TableName: "Vault",

      ExpressionAttributeValues: {
        ":formID": formID,
        ":submissionID": submissionID,
      },
      KeyConditionExpression: "FormID = :formID AND SubmissionID = :submissionID",
      ProjectionExpression: "FormID,SubmissionID,FormSubmission,Retrieved,SecurityAttribute",
    };
    const queryCommand = new QueryCommand(getItemsDbParams);

    const response = await documentClient.send(queryCommand);

    const parsedResponse = response.Items?.map(
      ({
        FormID: formID,
        SubmissionID: submissionID,
        FormSubmission: formSubmission,
        SecurityAttribute: securityAttribute,
      }) => ({
        formID,
        submissionID,
        formSubmission: JSON.parse(formSubmission),
        // In the future add Form Sumbission Files here
        // fileAttachments: getFileAttachments(submissionID, formSubmission),
        securityAttribute,
        // In the future add the Confirmation Code here
        // confirmationCode
      })
    )[0];

    // This will eventually be replaced by the user friendly random name on the submission object
    const htmlFileName = "ABC-123";

    const TestReactElement: React.FC<{
      formSubmission: Record<string, string>;
      formTemplate: FormRecord;
      confirmationCode?: string;
    }> = ({ formSubmission, confirmationCode = "TEST-CODE" }) => {
      return (
        <div>
          <p> This is a test HTML file response</p>
          <div>
            {Object.entries(formSubmission).map(([key, value]) => (
              <div key={key}>
                <p>Name: {key}</p>
                <p>Value: {value}</p>
              </div>
            ))}
          </div>
          <p>{`Confirm with the following confirmation code: ${confirmationCode}`}</p>
        </div>
      );
    };

    const htmlFile = renderToStaticNodeStream(
      <TestReactElement
        formSubmission={parsedResponse?.formSubmission}
        formTemplate={formTemplate}
      />
    );

    logMessage.info(
      `user:${session?.user.email} retrieved form responses ${
        parsedResponse && parsedResponse.submissionID
      } from form ID:${formID}}`
    );

    res.setHeader("Content-Disposition", `attachment; filename=${htmlFileName}.html`);

    return res.status(200).send(htmlFile);
  } catch (error) {
    if (error instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    logMessage.error(error as Error);
    res.status(500).json({ error: "Error on Server Side when fetching form's responses" });
  }
};

/**
 * Helper function to instantiate DynamoDB and Document client.
 * https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-document-client.html
 */
function connectToDynamo(): DynamoDBDocumentClient {
  //Create dynamodb client
  const db = new DynamoDBClient({
    region: process.env.AWS_REGION ?? "ca-central-1",
    endpoint: process.env.LOCAL_AWS_ENDPOINT,
  });

  return DynamoDBDocumentClient.from(db);
}

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
