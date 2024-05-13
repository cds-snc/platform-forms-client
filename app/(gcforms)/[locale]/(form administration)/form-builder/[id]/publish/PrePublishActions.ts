"use server";

import { SalesforceConnector } from "@lib/integration/salesforceConnector";

export async function UpdateSalesforceRecords(
  formId: string,
  formName: string,
  formType: string,
  description: string,
  reasonForPublish: string,
  userEmail: string,
  userId: string,
  userName: string
) {
  //Split userName into first and last name
  const nameArray = userName.split(" ");
  const firstName = nameArray[0] ?? "";
  const lastName = nameArray[1] ?? "";

  const sfConnector = new SalesforceConnector();
  await sfConnector.login();
  await sfConnector.AddPublishRecord(
    "test department",
    reasonForPublish,
    formId,
    formName,
    firstName,
    lastName,
    userEmail,
    userId,
    description,
    formType
  );
  //TODO : ^ Apply correct values, and do something with the object returned.
}
