import { Rest, requestAccessToken } from "ts-force";
import { Opportunity } from "./salesforce/Opportunity";
import { OpportunityLineItem } from "./salesforce/OpportunityLineItem";
import { Contact } from "./salesforce/Contact";

const SALESFORCE_URL = process.env.SALESFORCE_URL;
const SALESFORCE_CLIENT_ID = "" + process.env.SALESFORCE_CONSUMER_KEY;
const CURRENT_SALESFORCE_VERSION = "v60.0";

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

  // TODO : Cache this in Redis....
  private async GetRecordType() {
    const salesForceQuery = "SELECT Id FROM RecordType WHERE Name = 'Forms Product'";
    const retObj = await this.conn.query(salesForceQuery);
    return retObj.records[0].Id;
  }
  //TODO : Cache this in Redis....
  private async GetProduct2Id() {
    const salesForceQuery = "SELECT Id FROM Product2 WHERE Name = 'GC Forms'";
    const retObj = await this.conn.query(salesForceQuery);
    return retObj.records[0].Id;
  }
  //TODO : Cache this in Redis....
  private async GetPricebookEntryId() {
    const salesForceQuery = "SELECT Id FROM PricebookEntry WHERE Product2.Name = 'GC Forms'";
    const retObj = await this.conn.query(salesForceQuery);
    return retObj.records[0].Id;
  }

  // Provides the Account ID for a SalesForce Account based on the name of the account, if not found, it will return the account with the name 'Department not listed'
  private async GetAccountByName(name: string): Promise<string> {
    const salesForceQuery = "SELECT Id FROM Account WHERE Name = '" + name + "'";
    let retObj = await this.conn.query(salesForceQuery);

    if (retObj.totalSize === 0) {
      retObj = await this.conn.query("SELECT Id FROM Account WHERE Name = 'Department not listed'");
    }
    return retObj.records[0].Id;
  }

  private async GetOrCreateContact(
    userId: string,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<string> {
    let retObj = await this.GetContactId(userId);
    if (retObj == "") {
      const contactDetails = new Contact({
        firstName: firstName,
        lastName: lastName,
        contactId: userId,
        email: email,
      });

      const url = `/services/data/${CURRENT_SALESFORCE_VERSION}/sobjects/Contact`;
      const output = await this.conn.request.post(url, contactDetails.toJSON());
      retObj = output.data.id;
    }
    return retObj;
  }

  private async GetContactId(userId: string): Promise<string> {
    const salesForceQuery = "SELECT Id FROM Contact WHERE CDS_Contact_ID__c = '" + userId + "'";
    const retObj = await this.conn.query(salesForceQuery);
    if (retObj.totalSize === 0) {
      return "";
    } else {
      return retObj.records[0].Id;
    }
  }

  private async CreateOpportunity(opportunity: Opportunity): Promise<string> {
    const url = `/services/data/${CURRENT_SALESFORCE_VERSION}/sobjects/Opportunity`;
    const output = await this.conn.request.post(url, opportunity.toJSON());
    return output.data.id;
  }

  private async CreateOpportunityLineItem(
    opportunityLineItem: OpportunityLineItem
  ): Promise<string> {
    const url = `/services/data/${CURRENT_SALESFORCE_VERSION}/sobjects/OpportunityLineItem`;
    const output = await this.conn.request.post(url, opportunityLineItem.toJSON());
    return output.data.id;
  }

  //TODO : Refactor the constructor... it's a bit of a mess
  public async AddPublishRecord(
    departmentName: string,
    reasonForPublish: string,
    formName: string,
    contactFirstName: string,
    contactLastName: string,
    contactEmail: string,
    contactInternalId: string
  ): Promise<object> {
    const departmentId = await this.GetAccountByName(departmentName);
    const contactId = await this.GetOrCreateContact(
      contactInternalId,
      contactFirstName,
      contactLastName,
      contactEmail
    );

    const recordTypeId = await this.GetRecordType();
    const opportunity = new Opportunity({
      departmentId: departmentId,
      formName: formName,
      contactId: contactId,
      recordType: recordTypeId,
    });

    const newOpportunityId = await this.CreateOpportunity(opportunity);

    const product2Id = await this.GetProduct2Id();
    const pricebookEntryId = await this.GetPricebookEntryId();

    const opportunityLineItem = new OpportunityLineItem({
      opportunityId: newOpportunityId,
      productId: product2Id,
      pricebookEntryId: pricebookEntryId,
    });

    const results = await this.CreateOpportunityLineItem(opportunityLineItem);

    return { results };
  }
}
