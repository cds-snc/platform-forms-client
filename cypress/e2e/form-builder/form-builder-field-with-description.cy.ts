describe("Form builder description text", () => {
  beforeEach(() => {
    // cy.login({ acceptableUse: true });
    cy.visitPage("/en/form-builder/0000/edit");
  });

  it("Renders date element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="date"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get(".description-text").should("be.visible").contains("Format the date as: mm/dd/yyyy");
    cy.get(".example-text").should("be.visible").contains("mm/dd/yyyy");
  });

  it("Renders numeric element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="number"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get(".description-text").should("be.visible").contains("Enter a number");
    cy.get(".example-text").should("be.visible").contains("0123456789");
  });
});
