describe("CDS Platform Intake Form functionality", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.mockForm("../../__fixtures__/platformIntakeTestForm.json");
  });

  it("CDS Platform Intake Form renders", () => {
    cy.get("h1").contains("Work with CDS on a Digital Form");
  });
  it("Fill out and Submit the form", () => {
    cy.get("input[id='2']").type("Santa Claus").should("have.value", "Santa Claus");
    cy.get("input[id='3']")
      .type("santaclaus@northpole.global")
      .should("have.value", "santaclaus@northpole.global");
    cy.get("input[id='4']").type("CDS Gifts").should("have.value", "CDS Gifts");
    cy.get("input[id=5]").type("877-636-0656").should("have.value", "877-636-0656");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.get("input[id='7']")
      .type("Call me at my work number")
      .should("have.value", "Call me at my work number");

    cy.get("[type='submit']").click();
    cy.url().should("include", `/confirmation`);
    cy.get("h1").contains("Your submission has been received");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/sig-blk-en.svg");
    cy.get("#content").contains(
      "Thank you, your request has been submitted. A team member will email you shortly."
    );
  });
});
