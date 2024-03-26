/// Notify Fields:
/*
field_default_values = {
    "Name": service.name,
    "AccountId": account_id,
    "ContactId": contact_id,
    "CDS_Opportunity_Number__c": str(service.id),
    "Notify_Organization_Other__c": get_org_name_from_notes(service.organisation_notes, ORG_NOTES_OTHER_NAME_INDEX),
    "CloseDate": datetime.today().strftime("%Y-%m-%d"),
    "RecordTypeId": current_app.config["SALESFORCE_ENGAGEMENT_RECORD_TYPE"],
    "StageName": ENGAGEMENT_STAGE_TRIAL,
    "Type": ENGAGEMENT_TYPE,
    "CDS_Lead_Team__c": ENGAGEMENT_TEAM,
    "Product_to_Add__c": ENGAGEMENT_PRODUCT,
}
*/
export class Opportunity {
  departmentId: string; // accountId in Salesforce for the Department
  formName: string; // name in Salesforce
  contactId: string; // contactId in Salesforce for the Contact
  recordType: string; // hardcoded to "Notify Product" in Salesforce, ID for it is pulled from Salesforce
  // stageName is the "Stage" field hardcoded to "Published", as a dropdown in Salesforce
  // closeDate is the "Target Date" field (todo : validate???) hardcoded to today's date
  // Type is the "Type" field hardcoded to "New Business", as a dropdown in Salesforce
  // CDS_Lead_Team__c is the "Lead Team" field hardcoded to "Platform", as a dropdown in Salesforce
  // Product_to_Add__c is the "Product" field hardcoded to "GC Forms", as a dropdown in Salesforce

  constructor({
    departmentId,
    formName,
    contactId,
    recordType,
  }: {
    departmentId: string;
    formName: string;
    contactId: string;
    recordType: string;
  }) {
    this.departmentId = departmentId;
    this.formName = formName;
    this.contactId = contactId;
    this.recordType = recordType;
  }

  public toJSON(): object {
    return {
      AccountId: this.departmentId,
      Name: this.formName,
      StageName: "Published",
      CloseDate: new Date().toISOString(),
      ContactId: this.contactId,
      Type: "New Business",
      CDS_Lead_Team__c: "Platform",
      Product_to_Add__c: "GC Forms",
      RecordTypeId: this.recordType,
    };
  }
}

//todo : Have to add "product"
