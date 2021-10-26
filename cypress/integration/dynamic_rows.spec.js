describe("Dynamic Row Functionality", { baseUrl: "http://localhost:3000" }, () => {
  const formID = 76;

  // TODO: Mock the config of the form so it's always the same for this test.
  it("Adds then deletes a dynamic row", () => {
    cy.visit(`/en/id/${formID}`);
    cy.get("[data-testid='add-row-button-3']").click();
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 2);
    cy.get("[data-testid='add-row-button-3']").should("have.length", 1);
    cy.get("[data-testid='delete-row-button-3.0']").should("exist");
    cy.get("[data-testid='delete-row-button-3.1']").should("exist");
    cy.get("[data-testid='delete-row-button-3.1']").click();
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 1);
  });
});
