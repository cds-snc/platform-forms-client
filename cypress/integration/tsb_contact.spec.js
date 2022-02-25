describe("TSB Contact Form functionality", () => {
  it("TSB Contact Form renders", () => {
    cy.visit("/en/id/1?mockedFormFile=tsbContactTestForm");
    cy.get("h1").contains("Transportation Safety Board of Canada general enquiries");
  });
  it("Fill out the form", () => {
    cy.get("input[id='2']").type("Santa").should("have.value", "Santa");
    cy.get("input[id='3']")
      .type("santa@northpole.global")
      .should("have.value", "santa@northpole.global");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.get("input[id='5']")
      .type("Specifying what 'other' means")
      .should("have.value", "Specifying what 'other' means");
    cy.get("textarea[id='6']")
      .type("Contacting the Transportion Safety Board for a personal inquiry")
      .should("have.value", "Contacting the Transportion Safety Board for a personal inquiry");
  });
  it("Submit the Form", () => {
    cy.get("[type='submit']", { timeout: 60000 }).should("not.be.disabled").click();
    cy.url().should("include", `/confirmation`);
    cy.get("h1").contains("Thank you for your message");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/tsb-en.png");
    cy.get("#content").contains(
      "The Transportation Safety Board of Canada will respond to you within a week."
    );
  });
});
