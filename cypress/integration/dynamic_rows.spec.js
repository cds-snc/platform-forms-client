describe("Dynamic Row Functionality", { baseUrl: "http://localhost:3000" }, () => {
  const formID = 76; // Form: Copyright Board of Canada - Proposed Tariff Filing Form

  beforeEach(() => {
    cy.visit("/");
  });
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
    cy.get("[data-testid='delete-row-button-3.0']").should("not.exist");
    cy.get("[data-testid='delete-row-button-3.1']").should("not.exist");
  });
  
  it("Reinitialize a dynamic row's state after an error occurs", () => {
    cy.visit(`/en/id/${formID}`);
    cy.get("[data-testid='formGroup-3']")
      .find("[data-testid='dropdown']")
      .select("Artisti")
      .should("have.value", "Artisti");
    cy.get("button").contains("Submit").click();
    // add another row
    cy.get("[data-testid='add-row-button-3']").click();
    // check if the row was effectively added
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 2);
    // the initialvalue of the row must be undefined/empty
    cy.get("[data-testid='formGroup-3']").find("[name='3.1.1']").should("not.have.text", "");
  });
});
