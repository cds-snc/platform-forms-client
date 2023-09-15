describe("Deactivated Page", () => {
  afterEach(() => {
    cy.resetAll();
  });

  it("Reaches deactivated page after login", () => {
    cy.visitPage("/en/auth/login");
    cy.typeInField("input[id='username']", "test.deactivated@cds-snc.ca");
    cy.typeInField("input[id='password']", "testTesttest");
    cy.get("button[type='submit']").click();

    // Deactivated screen shows
    cy.url().should("contain", "/auth/account-deactivate");
    cy.get("h2").contains("Account deactivated");
    cy.get("a[href='/en/form-builder/support']").should("contain", "Contact support");
  });
});
