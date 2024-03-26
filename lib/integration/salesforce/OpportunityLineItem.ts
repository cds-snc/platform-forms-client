/* Notify Data

"OpportunityId": engagement_id,
"PricebookEntryId": current_app.config["SALESFORCE_ENGAGEMENT_STANDARD_PRICEBOOK_ID"],
"Product2Id": current_app.config["SALESFORCE_ENGAGEMENT_PRODUCT_ID"],
"Quantity": 1,
"UnitPrice": 0,
*/

export class OpportunityLineItem {
  opportunityId: string;
  productId: string;
  pricebookEntryId: string;

  constructor({
    opportunityId,
    productId,
    pricebookEntryId,
  }: {
    opportunityId: string;
    productId: string;
    pricebookEntryId: string;
  }) {
    this.opportunityId = opportunityId;
    this.productId = productId;
    this.pricebookEntryId = pricebookEntryId;
  }

  public toJSON(): object {
    return {
      OpportunityId: this.opportunityId,
      PricebookEntryId: this.pricebookEntryId,
      Product2Id: this.productId,
      Quantity: 1,
      UnitPrice: 0,
    };
  }
}
