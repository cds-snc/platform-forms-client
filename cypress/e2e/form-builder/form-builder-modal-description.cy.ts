describe("Form builder modal description", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder/edit");
  });

  it("Renders matching element description in more modal", () => {
    // see https://github.com/cds-snc/platform-forms-client/issues/2017

    cy.get("button").contains("Add").click();
    cy.get('[data-testid="date"]').click();
    cy.get("button").contains("Select block").click();
    cy.get(".description-text")
      .should("be.visible")
      .contains("Enter a date. For example: mm/dd/yyyy");
    cy.get(".example-text").should("be.visible").contains("mm/dd/yyyy");

    cy.get('#element-1 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("mm/dd/yyyy");
    cy.get("button").contains("Close").click();

    cy.get("button").contains("Add").click();
    cy.get('[data-testid="number"]').click();
    cy.get("button").contains("Select block").click();
    cy.get(".description-text").should("be.visible").contains("Only enter numbers");
    cy.get(".example-text").should("be.visible").contains("0123456789");

    cy.get('#element-2 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("Only enter numbers");
    cy.get("button").contains("Close").click();

    // rearrange the first element
    cy.get('#element-2 [data-testid="moveDown"]').click();

    // check that the descriptions are still correct
    cy.get('#element-1 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("mm/dd/yyyy");
    cy.get("button").contains("Close").click();

    cy.get('#element-2 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("Only enter numbers");
    cy.get("button").contains("Close").click();
  });
});
