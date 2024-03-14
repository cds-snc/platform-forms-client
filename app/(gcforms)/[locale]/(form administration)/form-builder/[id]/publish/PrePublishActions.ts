"use server";

import { SalesforceConnector } from "@lib/integration/salesforceConnector";

export async function UpdateSalesforceRecords() {
  const sfConnector = new SalesforceConnector();
  sfConnector.AddPublishRecord("test department", "test reason", "test form id");
}
