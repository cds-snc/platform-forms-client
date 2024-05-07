"use server";

import { SalesforceConnector } from "@lib/integration/salesforceConnector";

export async function UpdateSalesforceRecords(
  formId: string,
  formName: string,
  formType: string,
  description: string,
  reasonForPublish: string
) {
  const sfConnector = new SalesforceConnector();
  await sfConnector.login();
  await sfConnector.AddPublishRecord(
    "test department",
    reasonForPublish,
    formId,
    formName,
    "Vivian",
    "Nobrega",
    "vivian.nobrega@cds-snc.ca",
    "testAPIID",
    description,
    formType
  );
  //TODO : ^ Apply correct values, and do something with the object returned.
}
