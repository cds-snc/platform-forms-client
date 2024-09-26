describe("Form builder modal description", () => {
  const addElementButtonText = "Add form element";
  beforeEach(() => {
    cy.viewport("macbook-15");
    cy.visitPage("/en/form-builder/0000/edit");
  });

  it("Renders matching element description in more modal", () => {
    // see https://github.com/cds-snc/platform-forms-client/issues/2017

    cy.get("button").contains(addElementButtonText).click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="formattedDate"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get('[data-testid="example-date-element"').should("be.visible");

    cy.get('#element-1 [data-testid="more"]').click();
    cy.get("button").contains("Close").click();

    cy.get("button").contains(addElementButtonText).click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="number"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get(".description-text").should("be.visible").contains("Enter a number");
    cy.get(".example-text").should("be.visible").contains("0123456789");

    cy.get('#element-2 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("Enter a number");
    cy.get("button").contains("Close").click();
    // rearrange the first element
    cy.get('#element-2 [data-testid="moveDown"]').click();

    cy.get('#element-2 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("Enter a number");
    cy.get("button").contains("Close").click();
  });
});
