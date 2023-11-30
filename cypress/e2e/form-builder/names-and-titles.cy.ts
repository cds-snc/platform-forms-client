describe("Form builder names and titles", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder/edit");
  });

  it("Autocompletes name with title on focus", () => {
    cy.typeInField("#formTitle", "Cypress Share Test Form");
    cy.get("#fileName").click();
    cy.get("#fileName").should("have.value", "Cypress Share Test Form");
  });

  it("Accepts a blank name", () => {
    cy.typeInField("#formTitle", "Cypress Share Test Form");
    cy.get("#fileName").click();
    cy.get("#fileName").clear();
    cy.get("#fileName").should("have.value", "");
  });
});
