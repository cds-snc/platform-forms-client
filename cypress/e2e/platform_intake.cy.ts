describe("CDS Platform Intake Form functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/platformIntakeTestForm.json");
    cy.get("@formID").then((createdID) => (formID = createdID.toString()));
  });
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.visitForm(formID);
  });

  it("CDS Platform Intake Form renders", () => {
    cy.get("h1").contains("Work with CDS on a Digital Form");
  });
  it("Fill out and Submit the form", () => {
    cy.get("input[id='2']").type("Santa Claus");
    cy.get("input[id='2']").should("have.value", "Santa Claus");
    cy.get("input[id='3']").type("santaclaus@northpole.global");
    cy.get("input[id='3']").should("have.value", "santaclaus@northpole.global");
    cy.get("input[id='4']").type("CDS Gifts");
    cy.get("input[id='4']").should("have.value", "CDS Gifts");
    cy.get("input[id=5]").type("877-636-0656");
    cy.get("input[id=5]").should("have.value", "877-636-0656");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.get("input[id='7']").type("Call me at my work number");
    cy.get("input[id='7']").should("have.value", "Call me at my work number");

    cy.get("[type='submit']").click();
    cy.url().should("include", `/confirmation`);
    cy.get("h1").contains("Your request has been submitted");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/sig-blk-en.svg");
    cy.get("#content").contains("Thank you. Our team will contact you by email shortly.");
  });
});
