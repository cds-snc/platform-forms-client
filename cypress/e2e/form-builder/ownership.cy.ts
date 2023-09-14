describe("Form ownership", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder");
  });

  let formID: string;

  before(() => {
    cy.useForm("../../__fixtures__/cdsIntakeTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });

  it("Non-Admin cannot manage Form Ownership", () => {
    cy.login({ acceptableUse: true });
    cy.visitPage(`/form-builder/settings/${formID}/form`);
    cy.url().should("contain", "/en/admin/unauthorized");
  });

  it("Admin can manage Form Ownership", () => {
    cy.login({ admin: true, acceptableUse: true });
    cy.visitPage(`/form-builder/settings/${formID}/form`);
    cy.get("h2").contains("Manage ownership").should("be.visible");
  });

  it("Must have at least one owner", () => {
    cy.login({ admin: true, acceptableUse: true });
    cy.visitPage(`/form-builder/settings/${formID}/form`);
    cy.get("h2").contains("Manage ownership").should("be.visible");

    cy.get("[aria-label='Remove test.user@cds-snc.ca']").click();
    cy.get("[data-testid='save-ownership']").click();
    cy.get("[data-testid='alert']").contains("Must assign at least one user").should("be.visible");
  });
});
