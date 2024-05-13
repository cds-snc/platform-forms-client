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
  userName: string,
  administrative: string
) {
  //Split userName into first and last name
  const nameArray = userName.split(" ");
  const firstName = nameArray[0] ?? "";
  const lastName = nameArray[1] ?? "";

  //administrative should be yes (Admin) or no (nonAdmin)
  if (administrative === "admin") {
    administrative = "Yes";
  } else {
    administrative = "No";
  }

  const sfConnector = new SalesforceConnector();
  await sfConnector.login();
  await sfConnector.AddPublishRecord(
    "Department Not Listed", //Will set to this if user does not exist.
    reasonForPublish,
    formId,
    formName,
    firstName,
    lastName,
    userEmail,
    userId,
    description,
    formType,
    administrative
  );
}
