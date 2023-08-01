describe("Security Questions Redirect", () => {

  afterEach(() => {
    cy.resetAll();
  });

  it("Redirects to user profile page", () => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/auth/setup-security-questions");
    cy.url().should("contain", "/profile");
    cy.get("h1").should("contain", "Profile");
    cy.get("h2").should("contain", "Security questions");
  });
});
