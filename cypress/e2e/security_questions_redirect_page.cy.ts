describe("Security Questions Redirect", () => {
  afterEach(() => {
    cy.resetAll();
  });

  it("Redirects to user profile page", () => {
    cy.login({ acceptableUse: true });
    // cy.visit("/en/form-builder"); // not sure why but need to navigate to another page first
    cy.visit("/auth/setup-security-questions");
    cy.get("h1").should("contain", "Profile");
    cy.get("h2").should("contain", "Security questions");
  });
});
