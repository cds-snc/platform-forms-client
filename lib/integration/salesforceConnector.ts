import { Rest, requestAccessToken } from "ts-force";

const SALESFORCE_URL = process.env.SALESFORCE_URL;
const SALESFORCE_CLIENT_ID = "" + process.env.SALESFORCE_CONSUMER_KEY;

export class SalesforceConnector {
  private resp: any; // eslint-disable-line
  private conn: any; // eslint-disable-line

  constructor() {}

  public async login(): Promise<void> {
    const username = "" + process.env.SALESFORCE_USERNAME;
    const password = "" + process.env.SALESFORCE_PASSWORD;
    this.resp = await requestAccessToken({
      grant_type: "password",
      instanceUrl: SALESFORCE_URL,
      client_id: SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
      username: username,
      password: password,
    });

    this.conn = new Rest(this.resp);
  }

  public async logout(): Promise<void> {
    await this.conn.logout();
  }

  // Provides the Account ID for a SalesForce Account based on the name of the account, if not found, it will return the account with the name 'Department not listed'
  public async GetAccountByName(name: string): Promise<string> {
    const salesForceQuery = "SELECT Id FROM Account WHERE Name = '" + name + "'";
    let retObj = await this.conn.query(salesForceQuery);

    if (retObj.totalSize === 0) {
      retObj = await this.conn.query("SELECT Id FROM Account WHERE Name = 'Department not listed'");
    }

    return retObj.records[0].Id;
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
