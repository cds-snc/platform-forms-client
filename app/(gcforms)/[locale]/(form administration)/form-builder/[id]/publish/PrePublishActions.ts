"use server";

import { SalesforceConnector } from "@lib/integration/salesforceConnector";

export async function UpdateSalesforceRecords() {
  const sfConnector = new SalesforceConnector();
  sfConnector.login("vivian.nobrega@cds-snc.ca.qa", "QJC_rjd5ueg-wzb7hqp");
  //let meow = await sfConnector.GetAccountByName("test department");
  //console.log(meow);
  //sfConnector.AddPublishRecord("test department", "test reason", "test form id");
  //console.log("okay, what did Salesforce do?");
}
