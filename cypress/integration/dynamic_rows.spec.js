describe("Dynamic Row Functionality", () => {
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
    // add second row
    cy.get("[data-testid='add-row-button-3']").click();
    // add third row
    cy.get("[data-testid='add-row-button-3']").click();
    // should have 3 rows
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 3);
    cy.clock(new Date());
    cy.tick(30000);
    cy.get("button").contains("Submit").click();
    // add another row
    cy.get("[data-testid='add-row-button-3']").click();
    // check if the row was effectively added
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 4);
    // the initialvalue of the row must be undefined/empty
    cy.get("[data-testid='formGroup-3']").find("[name='3.3.1']").should("not.have.text", "");
  });

  // https://github.com/cds-snc/platform-forms-client/issues/511
  it("Should have 2 rows left when a middle row is deleted", () => {
    cy.visit(`/en/id/${formID}`);
    // add second row
    cy.get("[data-testid='add-row-button-3']").click();
    // add third row
    cy.get("[data-testid='add-row-button-3']").click();
    // should have 3 rows
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 3);
    // delete the second row
    cy.get("[data-testid='delete-row-button-3.1']").click();
    // should have 2 rows left
    cy.get("[data-testid='formGroup-3']").find("[data-testid='dropdown']").should("have.length", 2);
  });

  it("Should display errors when an empty form is submitted", () => {
    cy.visit(`/en/id/${formID}`);
    cy.clock(new Date());
    cy.tick(30000);
    cy.get("[type='submit']").click();
    cy.get(".gc-error-link").should("have.length", 8);
    cy.get(".gc-error-message").should("have.length", 8);
    cy.get("[id='7.0.0']").should("have.css", "border-color", "rgb(185, 28, 28)");
    // add second row
    cy.get("[data-testid='add-row-button-3']").click();
    cy.get("[type='submit']").click();
    cy.get(".gc-error-link").should("have.length", 9);
    cy.get(".gc-error-message").should("have.length", 9);
  });
});
