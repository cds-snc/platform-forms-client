describe("Register Page", () => {
  // using before() for the login bit probably won't work because this is only a temp user sessions

  beforeEach(() => {
    // Login the user
    cy.visitPage("/en/auth/login");
    cy.get("input[id='username']").type("testadmin.user@cds-snc.ca");
    cy.get("input[id='password']").type("testTesttest");
    cy.get("button[type='submit']").click();
    cy.get("input[id='verificationCode']").type("1"); // Try a few times, the autofocus may take focus away
    cy.get("input[id='verificationCode']").type("1");
    cy.get("input[id='verificationCode']").type("1");
    cy.get("input[id='verificationCode']").clear();
    cy.get("input[id='verificationCode']").type("12345");
    cy.get("button[type='submit']").click();

    // Get past the new user screens
    cy.get("button[id='acceptableUse']").click();
    cy.get("[data-testid='skipStepButton']").click();

    // Go to the accounts page
    cy.visitPage("/en/admin/accounts");
  });

  it("Get page content", () => {
    cy.get("h1").should("contain", "Accounts");
  });
});
