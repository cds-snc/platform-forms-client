import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { chunkArray } from "../common/utils";
import { dynamodbClientQueue, s3ClientQueue } from "../common/operationQueues";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";

interface FormResponse {
  formId: string;
  name: string;
  confirmationCode: string;
  submissionAttachments: string | undefined;
}

const dynamodbClient = new DynamoDBClient({
  region: "ca-central-1",
  retryMode: "standard",
});

const s3Client = new S3Client({
  region: "ca-central-1",
  retryMode: "standard",
});

export async function deleteResponses(formId: string): Promise<void> {
  let lastEvaluatedKey = null;

  while (lastEvaluatedKey !== undefined) {
    const responsesToDelete = await retrieveResponsesToDeleteFromDynamodb(
      formId,
      lastEvaluatedKey ?? undefined
    );

    const fileAttachments = responsesToDelete.responses
      .filter((r) => r.submissionAttachments !== undefined)
      .flatMap((r) => {
        if (r.submissionAttachments === undefined) {
          throw new Error("submissionAttachments can't be undefined");
        }

        const attachments: { path: string }[] = JSON.parse(r.submissionAttachments);
        return attachments.map((a) => a.path);
      });

    await deleteFileAttachmentsFromS3(fileAttachments);
    await deleteResponsesFromDynamodb(responsesToDelete.responses);

    lastEvaluatedKey = responsesToDelete.lastEvaluatedKey;
  }
}

async function retrieveResponsesToDeleteFromDynamodb(
  formId: string,
  lastEvaluatedKey?: Record<string, any>
): Promise<{ responses: FormResponse[]; lastEvaluatedKey?: Record<string, any> }> {
  return dynamodbClientQueue(() => {
    return dynamodbClient
      .send(
        new QueryCommand({
          TableName: "Vault",
          Limit: 100,
          ExclusiveStartKey: lastEvaluatedKey,
          KeyConditionExpression:
            "FormID = :formId AND begins_with(NAME_OR_CONF, :nameOrConfPrefix)",
          ProjectionExpression: "FormID,#name,ConfirmationCode,SubmissionAttachments",
          ExpressionAttributeNames: {
            "#name": "Name",
          },
          ExpressionAttributeValues: {
            ":formId": formId,
            ":nameOrConfPrefix": "NAME#",
          },
        })
      )
      .then((response) => {
        return {
          responses:
            response.Items?.map((item) => ({
              formId: item.FormID,
              name: item.Name,
              confirmationCode: item.ConfirmationCode,
              submissionAttachments: item.SubmissionAttachments,
            })) ?? [],
          lastEvaluatedKey: response.LastEvaluatedKey,
        };
      });
  });
}

async function deleteFileAttachmentsFromS3(fileAttachments: string[]) {
  if (fileAttachments.length === 0) return;

  const deleteFileAttachmentsOperations = fileAttachments.map((filePath) => {
    return s3ClientQueue(() => {
      return s3Client.send(
        new DeleteObjectsCommand({
          Bucket: "forms-staging-vault-file-storage",
          Delete: {
            Objects: fileAttachments.map((f) => ({ Key: filePath })),
          },
        })
      );
    });
  });

  await Promise.all(deleteFileAttachmentsOperations);
}

async function deleteResponsesFromDynamodb(responses: FormResponse[]) {
  if (responses.length === 0) return;

  /**
   * The `BatchWriteCommand` can only take up to 25 `DeleteRequest` at a time.
   * We have to delete 2 items from DynamoDB for each form response (12*2=24).
   */

  const deleteResponsesOperations = chunkArray(responses, 12).map((responseChunk) => {
    return dynamodbClientQueue(() =>
      dynamodbClient.send(
        new BatchWriteCommand({
          RequestItems: {
            ["Vault"]: responseChunk.flatMap((r) => {
              return [
                {
                  DeleteRequest: {
                    Key: {
                      FormID: r.formId,
                      NAME_OR_CONF: `NAME#${r.name}`,
                    },
                  },
                },
                {
                  DeleteRequest: {
                    Key: {
                      FormID: r.formId,
                      NAME_OR_CONF: `CONF#${r.confirmationCode}`,
                    },
                  },
                },
              ];
            }),
          },
        })
      )
    );
  });

  await Promise.all(deleteResponsesOperations);
}
