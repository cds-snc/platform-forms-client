describe("CDS Platform Intake Form functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/platformIntakeTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => {
    cy.visitForm(formID);
  });

  it("CDS Platform Intake Form renders", () => {
    cy.get("h1").contains("Work with CDS on a Digital Form");
  });
  it("Fill out and Submit the form", () => {
    cy.typeInField("input[id='2']", "Santa Claus");
    cy.typeInField("input[id='3']", "santaclaus@northpole.global");
    cy.typeInField("input[id='4']", "CDS Gifts");
    cy.typeInField("input[id=5]", "877-636-0656");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.typeInField("input[id='7']", "Call me at my work number");

    cy.get("[type='submit']").click();
    cy.get("h1").contains("Your form has been submitted");
    cy.get("#content").contains("Thank you. Our team will contact you by email shortly.");
  });
});
