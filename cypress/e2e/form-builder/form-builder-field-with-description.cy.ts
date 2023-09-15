describe("Form builder description text", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder/edit");
  });

  it("Renders date element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="date"]').click();
    cy.get("button").contains("Select block").click();
    cy.get(".description-text")
      .should("be.visible")
      .contains("Enter a date. For example: mm/dd/yyyy");
    cy.get(".example-text").should("be.visible").contains("mm/dd/yyyy");
  });

  it("Renders numeric element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="number"]').click();
    cy.get("button").contains("Select block").click();
    cy.get(".description-text").should("be.visible").contains("Only enter numbers");
    cy.get(".example-text").should("be.visible").contains("0123456789");
  });
});
