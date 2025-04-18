describe("Attestation functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/attestationTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => {
    cy.visitForm(formID);
  });

  it("Renders properly", () => {
    cy.get("body").contains("all checkboxes required");
  });

  it("Displays error when submitting form without checking both boxes", () => {
    cy.get("[type='submit']").click();
    cy.get("li").contains("Check off all the boxes for");
    cy.get("p").contains("Read and check all boxes to confirm the items in this section.");
  });

  it("Displays error when submitting form with a single checkbox selected", () => {
    cy.get("div[data-testid='1.0']").find("label").click();
    cy.get("[type='submit']").click();
    cy.get("li").contains("Check off all the boxes for");
    cy.get("p").contains("Read and check all boxes to confirm the items in this section.");
  });

  it("Submits properly", () => {
    cy.get("div[data-testid='1.0']").find("label").click();
    cy.get("div[data-testid='1.1']").find("label").click();
    cy.get("[type='submit']").click();
    cy.get("h1").contains("Your submission has been received");
  });
});
