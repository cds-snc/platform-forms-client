// Notify fields:
/* field_default_values = {
            "FirstName": name_parts["first"],
            "LastName": name_parts["last"],
            "Title": "created by Notify API",
            "CDS_Contact_ID__c": str(user.id),
            "Email": user.email_address,
        }
*/
export class Contact {
  firstName: string;
  lastName: string;
  contactId: string;
  email: string;

  constructor({
    firstName,
    lastName,
    contactId,
    email,
  }: {
    firstName: string;
    lastName: string;
    contactId: string;
    email: string;
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.contactId = contactId;
    this.email = email;
  }

  public toJSON(): object {
    return {
      FirstName: this.firstName,
      LastName: this.lastName,
      Title: "Created by GC Forms via API",
      CDS_Contact_ID__c: this.contactId,
      Email: this.email,
    };
  }
}
