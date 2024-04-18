describe("Security Questions Redirect", () => {
  afterEach(() => {
    // cy.resetAll();
  });

  // Works in real life but test is an issue.
  // Will rework after layout is refactored
  it.skip("Redirects to user profile page", () => {
    cy.login({ acceptableUse: true });
    // Need to navigate to a page because `cy.login` only deals with the API calls
    cy.location("pathname").should("equal", "/en/forms");

    cy.visitPage("/en/auth/setup-security-questions");
    cy.url().should("contain", "/en/auth/profile");
    cy.get("h1").should("contain", "Profile");
    cy.get("h2").should("contain", "Security questions");
  });
});
