"use server";

import { athenaClient } from "@lib/integration/awsServicesConnector";
import {
  StartQueryExecutionCommand,
  QueryExecutionState,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from "@aws-sdk/client-athena";

export async function getMetrics() {
  const queryCommand = new StartQueryExecutionCommand({
    QueryString: "EXECUTE metric_number_of_forms",
    WorkGroup: "data-lake-local",
  });
  const queryId = (await athenaClient.send(queryCommand)).QueryExecutionId;
  //console.log("Query ID: " + queryId);
  const results = await CheckQueryResults(queryId || "");
  //console.log(results);
  return {
    //eg : [ { 'Form Count': '6' } ]
    formCount: results[0]["Form Count"],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function CheckQueryResults(queryId: string): Promise<any> {
  const response = await athenaClient.send(
    new GetQueryExecutionCommand({ QueryExecutionId: queryId })
  );
  const state = response.QueryExecution?.Status?.State;

  if (state == QueryExecutionState.QUEUED || state == QueryExecutionState.RUNNING) {
    await timeout(1000);
    const results = await CheckQueryResults(queryId);
    return MapDataResults(results);
  } else if (state == QueryExecutionState.SUCCEEDED) {
    const results = await athenaClient.send(
      new GetQueryResultsCommand({ QueryExecutionId: queryId })
    );
    return results.ResultSet;
  } else {
    //console.log(response.QueryExecution);
    throw new Error("Query failed with state: " + state);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function MapDataResults(data: any) {
  const map: { [key: string]: string | null }[] = [];
  const columns = data.Rows[0].Data.map((column: { VarCharValue: string }) => {
    return column.VarCharValue;
  });

  data.Rows.forEach((item: { Data: { VarCharValue: string }[] }, i: number) => {
    if (i === 0) {
      return;
    }

    const mappedObject: { [key: string]: string | null } = {};
    item.Data.forEach((value, j) => {
      if (value.VarCharValue) {
        mappedObject[columns[j]] = value.VarCharValue;
      } else {
        mappedObject[columns[j]] = null;
      }
    });

    map.push(mappedObject);
  });

  return map;
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
