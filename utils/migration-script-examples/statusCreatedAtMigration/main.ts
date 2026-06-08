/* eslint-disable no-console */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, ScanCommandOutput, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import { RDSDataClient, ExecuteStatementCommand } from "@aws-sdk/client-rds-data";
import { format } from "@fast-csv/format";
import { createWriteStream } from "fs";

type OverdueResponsesSummaryEntry = {
  total: number;
  new: number;
  downloaded: number;
};

type OverdueResponsesSummary = {
  overall: OverdueResponsesSummaryEntry;
  between46and60days: OverdueResponsesSummaryEntry;
  above61days: OverdueResponsesSummaryEntry;
};

type FormEntry = {
  classification?: string;
  isAdministrativeForm?: boolean;
  isPublished?: boolean;
  isClosed?: boolean;
  owners?: string[];
  overdueResponsesSummary: OverdueResponsesSummary;
};

type VaultResult = {
  FormID: string;
  Name: string;
  "Status#CreatedAt": string;
  CreatedAt: number;
};

const dynamodbClient = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "ca-central-1",
});

const rdsDataClient = new RDSDataClient({ region: process.env.AWS_REGION ?? "ca-central-1" });

const main = async () => {
  try {
    const aggregatedResults: Record<string, FormEntry> = {};

    let lastEvaluatedKey = null;

    // let iteration = 0;

    while (lastEvaluatedKey !== undefined) {
      const scanResults: ScanCommandOutput = await dynamodbClient.send(
        new ScanCommand({
          TableName: "Vault",
          IndexName: "StatusCreatedAt",
          ExclusiveStartKey: lastEvaluatedKey ?? undefined,
          FilterExpression:
            "(begins_with(#statusCreatedAt, :statusNew) OR begins_with(#statusCreatedAt, :statusDownloaded)) AND CreatedAt <= :createdAt",
          ProjectionExpression: "FormID,#name,#statusCreatedAt,CreatedAt",
          ExpressionAttributeNames: {
            "#statusCreatedAt": "Status#CreatedAt",
            "#name": "Name",
          },
          ExpressionAttributeValues: {
            ":statusNew": "New",
            ":statusDownloaded": "Downloaded",
            ":createdAt": Date.now() - 2419200000, // 2419200000 milliseconds = 28 days
          },
        })
      );

      const items = (scanResults.Items ?? []) as VaultResult[];

      for (const item of items) {
        aggregatedResults[item.FormID] ??= {
          overdueResponsesSummary: {
            overall: { total: 0, new: 0, downloaded: 0 },
            between46and60days: { total: 0, new: 0, downloaded: 0 },
            above61days: { total: 0, new: 0, downloaded: 0 },
          },
        };

        const diffMs = Math.abs(Date.now() - item.CreatedAt);
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        aggregatedResults[item.FormID] = {
          overdueResponsesSummary: {
            overall: {
              total: aggregatedResults[item.FormID].overdueResponsesSummary.overall.total + 1,
              new:
                aggregatedResults[item.FormID].overdueResponsesSummary.overall.new +
                (item["Status#CreatedAt"].includes("New") ? 1 : 0),
              downloaded:
                aggregatedResults[item.FormID].overdueResponsesSummary.overall.downloaded +
                (item["Status#CreatedAt"].includes("Downloaded") ? 1 : 0),
            },
            between46and60days:
              diffDays > 45 && diffDays < 61
                ? {
                    total:
                      aggregatedResults[item.FormID].overdueResponsesSummary.between46and60days
                        .total + 1,
                    new:
                      aggregatedResults[item.FormID].overdueResponsesSummary.between46and60days
                        .new + (item["Status#CreatedAt"].includes("New") ? 1 : 0),
                    downloaded:
                      aggregatedResults[item.FormID].overdueResponsesSummary.between46and60days
                        .downloaded + (item["Status#CreatedAt"].includes("Downloaded") ? 1 : 0),
                  }
                : aggregatedResults[item.FormID].overdueResponsesSummary.between46and60days,
            above61days:
              diffDays > 60
                ? {
                    total:
                      aggregatedResults[item.FormID].overdueResponsesSummary.above61days.total + 1,
                    new:
                      aggregatedResults[item.FormID].overdueResponsesSummary.above61days.new +
                      (item["Status#CreatedAt"].includes("New") ? 1 : 0),
                    downloaded:
                      aggregatedResults[item.FormID].overdueResponsesSummary.above61days
                        .downloaded + (item["Status#CreatedAt"].includes("Downloaded") ? 1 : 0),
                  }
                : aggregatedResults[item.FormID].overdueResponsesSummary.above61days,
          },
        };
      }

      lastEvaluatedKey = scanResults.LastEvaluatedKey;

      // if (iteration > 5) {
      //   break;
      // } else {
      //   iteration++;
      // }
    }

    for (const key in aggregatedResults) {
      const templateInformation = await getTemplateInformation(key);

      aggregatedResults[key] = {
        classification: templateInformation?.classification,
        isAdministrativeForm: templateInformation?.isAdministrativeForm,
        isPublished: templateInformation?.isPublished,
        isClosed: templateInformation?.isClosed,
        owners: templateInformation?.owners,
        overdueResponsesSummary: aggregatedResults[key].overdueResponsesSummary,
      };
    }

    // JSON results
    // await writeFile(
    //   "results.json",
    //   JSON.stringify(
    //     {
    //       totalNumberOfForms: Object.keys(aggregatedResults).length,
    //       listOfForms: aggregatedResults,
    //     },
    //     null,
    //     2
    //   ),
    //   "utf8"
    // );

    // CSV results
    const csvStream = format({ headers: true });
    const writableStream = createWriteStream("results.csv");
    csvStream.pipe(writableStream).on("end", () => process.exit());

    for (const key in aggregatedResults) {
      csvStream.write({
        "Form ID": key,
        Classification: aggregatedResults[key].classification ?? "n/a",
        "Is administrative form":
          aggregatedResults[key].isAdministrativeForm === undefined
            ? "n/a"
            : aggregatedResults[key].isAdministrativeForm
              ? "Yes"
              : "No",
        "Is form published":
          aggregatedResults[key].isPublished === undefined
            ? "n/a"
            : aggregatedResults[key].isPublished
              ? "Yes"
              : "No",
        "Is form closed":
          aggregatedResults[key].isClosed === undefined
            ? "n/a"
            : aggregatedResults[key].isClosed
              ? "Yes"
              : "No",
        Owners: aggregatedResults[key].owners?.join("\r\n") ?? "n/a",
        "Overall (28+ days) overdue responses (Total)": `${aggregatedResults[key].overdueResponsesSummary.overall.total}`,
        "Overall (28+ days) overdue responses (New)": `${aggregatedResults[key].overdueResponsesSummary.overall.new}`,
        "Overall (28+ days) overdue responses (Downloaded)": `${aggregatedResults[key].overdueResponsesSummary.overall.downloaded}`,
        "46-60 days overdue responses (Total)": `${aggregatedResults[key].overdueResponsesSummary.between46and60days.total}`,
        "46-60 days overdue responses (New)": `${aggregatedResults[key].overdueResponsesSummary.between46and60days.new}`,
        "46-60 days overdue responses (Downloaded)": `${aggregatedResults[key].overdueResponsesSummary.between46and60days.downloaded}`,
        "61+ days overdue responses (Total)": `${aggregatedResults[key].overdueResponsesSummary.above61days.total}`,
        "61+ days overdue responses (New)": `${aggregatedResults[key].overdueResponsesSummary.above61days.new}`,
        "61+ days overdue responses (Downloaded)": `${aggregatedResults[key].overdueResponsesSummary.above61days.downloaded}`,
      });
    }

    csvStream.end();
  } catch (error) {
    console.log(error);
  }
};

// config() adds the .env variables to process.env
config();

main();

async function getTemplateInformation(id: string): Promise<
  | {
      classification: string;
      isAdministrativeForm: boolean;
      isPublished: boolean;
      isClosed: boolean;
      owners: string[];
    }
  | undefined
> {
  const queryResponse = await rdsDataClient.send(
    new ExecuteStatementCommand({
      database: process.env.DATABASE_NAME,
      resourceArn: process.env.DATABASE_CLUSTER_RESOURCE_ARN,
      secretArn: process.env.DATABASE_CREDENTIALS_SECRET_ARN,
      sql: `
        SELECT tem."securityAttribute", tem."formPurpose", tem."isPublished", tem."closingDate", ARRAY_AGG(usr."email" ORDER BY usr."email") AS emails
        FROM "Template" tem
        JOIN "_TemplateToUser" ttu ON tem."id" = ttu."A"
        JOIN "User" usr ON usr."id" = ttu."B"
        WHERE tem."id" = '${id}'
        GROUP BY tem."id"
      `,
    })
  );

  if (queryResponse.records === undefined || queryResponse.records.length === 0) {
    return undefined;
  }

  return {
    classification: queryResponse.records!![0][0].stringValue!!,
    isAdministrativeForm: queryResponse.records!![0][1].stringValue!! === "admin",
    isPublished: queryResponse.records!![0][2].booleanValue!!,
    isClosed: isFormClosed(queryResponse.records!![0][3].stringValue!!),
    owners: queryResponse.records!![0][4].arrayValue!!.stringValues!! as string[],
  };
}

function isFormClosed(closingDate: string): boolean {
  let isPastClosingDate = false;

  if (closingDate) {
    isPastClosingDate = dateHasPast(Date.parse(closingDate));
  }

  return isPastClosingDate;
}

function dateHasPast(timestamp: number) {
  const now = new Date();

  if (now.getTime() > timestamp) {
    return true;
  }

  return false;
}
