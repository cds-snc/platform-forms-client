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
  title: string;
  contactId: string;
  email: string;

  constructor({
    firstName,
    lastName,
    title,
    contactId,
    email,
  }: {
    firstName: string;
    lastName: string;
    title: string;
    contactId: string;
    email: string;
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.title = title;
    this.contactId = contactId;
    this.email = email;
  }

  public toJSON(): string {
    return JSON.stringify({
      FirstName: this.firstName,
      LastName: this.lastName,
      Title: this.title,
      CDS_Contact_ID__c: this.contactId,
      Email: this.email,
    });
  }
}
