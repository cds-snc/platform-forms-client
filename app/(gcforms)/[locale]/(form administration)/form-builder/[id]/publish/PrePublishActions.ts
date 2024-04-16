"use server";

import { SalesforceConnector } from "@lib/integration/salesforceConnector";

export async function UpdateSalesforceRecords() {
  const sfConnector = new SalesforceConnector();
  await sfConnector.login();
  await sfConnector.AddPublishRecord(
    "test department",
    "test reason",
    "test form id",
    "Vivian",
    "Nobrega",
    "vivian.nobrega@cds-snc.ca",
    "testAPIID"
  );
  //TODO : ^ Apply correct values, and do something with the object returned.
}
