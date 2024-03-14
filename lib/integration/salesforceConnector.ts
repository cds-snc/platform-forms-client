import { Rest, requestAccessToken } from "ts-force";

const SALESFORCE_URL = process.env.SALESFORCE_URL;
const SALESFORCE_CLIENT_ID = "" + process.env.SALESFORCE_CONSUMER_KEY;

export class SalesforceConnector {
  private resp: any; // eslint-disable-line
  private conn: any; // eslint-disable-line

  constructor() {}

  public async login(username: string, password: string): Promise<void> {
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
