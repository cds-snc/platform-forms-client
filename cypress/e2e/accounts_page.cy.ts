describe("Accounts Page", () => {
  // using before() for the login bit probably won't work because this is only a temp user sessions

  beforeEach(() => {
    cy.login(true, true)

    // Go to the accounts page
    cy.visitPage("/en/admin/accounts");
  });

  after(() => {
    cy.resetAll();
  });

  it("Accounts page loads with title", () => {
    cy.get("h1").should("contain", "Accounts");
  });

});
