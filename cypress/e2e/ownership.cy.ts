describe("Form Ownership", () => {
  let formID: string;

  before(() => {
    cy.useForm("../../__fixtures__/cdsIntakeTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });

  describe("Regular User", () => {
    it("Non-Admin cannot manage Form Ownership", () => {
      cy.userSession({ admin: false });
      cy.visitPage(`/en/form-builder/${formID}/settings/manage`);
      cy.get("[data-testid='form-ownership']").should("not.exist");
    });
  });

  describe("Admin User", () => {
    beforeEach(() => {
      cy.userSession({ admin: true });
    });
    it("Admin can manage Form Ownership", () => {
      cy.visitPage(`/en/form-builder/${formID}/settings/manage`);
      cy.get("h2").contains("Manage ownership").should("be.visible");
    });

    it("Must have at least one owner", () => {
      cy.visitPage(`/en/form-builder/${formID}/settings/manage`);
      cy.get("h2").contains("Manage ownership").should("be.visible");

      cy.get("[aria-label='Remove test.user@cds-snc.ca']").click();
      cy.get("[data-testid='save-ownership']").click();
      cy.get("[data-testid='alert']")
        .contains("Must assign at least one user")
        .should("be.visible");
    });
  });
});
