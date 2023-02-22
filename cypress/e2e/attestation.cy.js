describe("Attestation functionality", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.mockForm("../../__fixtures__/attestationTestForm.json");
  });

  it("Renders properly", () => {
    cy.get("body").contains("all checkboxes required");
  });

  it("Displays error when submitting form without checking both boxes", () => {
    cy.get("[type='submit']").click();
    cy.get("li").contains("Read and check all boxes to confirm the items in this section.");
    cy.get("p").contains("Read and check all boxes to confirm the items in this section.");
  });

  it("Displays error when submitting form with a single checkbox selected", () => {
    cy.get("div[data-testid='1.0'] label").click();
    cy.get("[type='submit']").click();
    cy.get("li").contains("Read and check all boxes to confirm the items in this section.");
    cy.get("p").contains("Read and check all boxes to confirm the items in this section.");
  });

  it("Submits properly", () => {
    cy.get("div[data-testid='1.0'] label").click();
    cy.get("[data-testid='1.1'] label").click();
    cy.get("[type='submit']").click();
    cy.url().should("include", `/confirmation`);
    cy.get("h1").contains("Your submission has been received");
  });
});
