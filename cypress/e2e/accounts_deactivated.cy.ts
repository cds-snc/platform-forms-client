describe("Deactivated Page", () => {
  afterEach(() => {
    cy.resetAll();
  });

  it("Reaches deactivated page after login", () => {
    cy.visitPage("/en/auth/login");
    cy.get("input[id='username']").type("test.deactivated@cds-snc.ca");
    cy.get("input[id='password']").type("testTesttest");
    cy.get("button[type='submit']").click();

    // Deactivated screen shows
    cy.url().should("contain", "/auth/account-deactivate");
    cy.get("h2").contains("Account deactivated");
    cy.get("a[href='/en/form-builder/support']").should("contain", "Contact support");
  });
});
