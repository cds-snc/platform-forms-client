import * as jsforce from "jsforce";

const SALESFORCE_URL = process.env.SALESFORCE_URL;

export class SalesforceConnector {
  private conn: jsforce.Connection;

  constructor() {
    this.conn = new jsforce.Connection({
      loginUrl: SALESFORCE_URL,
      oauth2: {
        clientId: process.env.SALESFORCE_CLIENT_ID,
        clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
        redirectUri: process.env.SALESFORCE_REDIRECT_URI,
      },
    });
  }

  public async login(username: string, password: string): Promise<void> {
    await this.conn.login(username, password);
  }

  public async query(query: string): Promise<void> {
    return this.conn.query(query);
  }

  public async logout(): Promise<void> {
    await this.conn.logout();
  }

  // TO DO: Replace 'any' with the correct type
  public GetAccountByName(name: string): Promise<any> {
    // eslint-disable-line
    let retObj = this.conn.sobject("Account").find({ Name: name });
    // If the account is not found, find the account by the name 'department not listed'
    if (retObj == null) {
      retObj = this.conn.sobject("Account").find({ Name: "Department Not Listed" });
    }
    return retObj;
  }

  public async AddPublishRecord(
    departmentName: string,
    reasonForPublish: string,
    formId: string
  ): Promise<void> {
    const departmentId = this.GetAccountByName(departmentName).Id;
    await this.conn
      .sobject("PublishRecord")
      .create({ AccountId: departmentId, ReasonForPublish: reasonForPublish, FormId: formId });
  }
}
