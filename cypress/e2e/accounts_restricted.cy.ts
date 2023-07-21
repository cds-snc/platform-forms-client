describe("Restricted Access Page", () => {
  afterEach(() => {
    cy.resetAll();
  });

  it("Accounts page loads with title", () => {
    cy.intercept("/api/account/submissions/overdue", {
      statusCode: 200,
      body: { hasOverdueSubmissions: true },
    });

    cy.visit("/auth/login");
    cy.contains("Sign in").click();
    cy.get("input[id='username']").type("test.user@cds-snc.ca");
    cy.get("input[id='password']").type("testTesttest");
    cy.get("button[type='submit']").click();
    cy.get("input[id='verificationCode']").should("be.visible");
    cy.get("input[id='verificationCode']").type("12345");
    cy.get("button[type='submit']").click();
    cy.url().should("contain", "auth/restricted-access");
    cy.get("h2").contains("Restricted access to responses");
    cy.contains("Continue").click();
    cy.url().should("contain", "/auth/policy");
  });
});
