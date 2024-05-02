describe("Restricted Access Page", () => {
  afterEach(() => {
    cy.resetAll();
  });

  it("Accounts page loads with title", () => {
    cy.intercept("/api/account/submissions/overdue", {
      statusCode: 200,
      body: { hasOverdueSubmissions: true },
    });

    cy.visitPage("/auth/login");
    cy.contains("Sign in").click();
    cy.typeInField("input[id='username']", "test.user@cds-snc.ca");
    cy.typeInField("input[id='password']", "testTesttest");
    cy.get("button[type='submit']").click();
    cy.get("input[id='verificationCode']").should("be.visible");
    cy.typeInField("input[id='verificationCode']", "12345");
    cy.get("button[type='submit']").click();
    cy.url().should("contain", "auth/restricted-access");
    cy.get("h2").contains("Restricted access to responses");
    cy.contains("Continue").click();
    cy.url().should("contain", "/auth/policy");
  });
});
