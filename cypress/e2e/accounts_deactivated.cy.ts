describe("Deactivated Page", () => {
  const testUserEmail = "test.user@cds-snc.ca";

  afterEach(() => {
    cy.resetAll();
  });

  it("Deactivate user and test deactivated users in one step so user state saved", () => {
    // Deactivate the test user as the admin user
    cy.login(true, true);
    cy.visitPage("/en/admin/accounts");
    cy.get(`li[data-testid='${testUserEmail}']`).contains("More").click();
    cy.get("div[role='menuitem']").contains("Deactivate account").click();
    cy.get("dialog").contains("Deactivate account").click();
    cy.get(`li[data-testid='${testUserEmail}']`).contains("Reactivate account");
    cy.logout();
    // cy.visitPage("/en/auth/logout");

    // Manually log in the deactivated test user
    // -or- could just call cy.login(false, true); and cy.visitPage("/en/auth/account-deactivate");
    cy.visitPage("/en/auth/login");
    cy.get("input[id='username']").type("test.user@cds-snc.ca");
    cy.get("input[id='password']").type("testTesttest");
    cy.get("button[type='submit']").click();
    cy.get("input[id='verificationCode']").should("be.visible");
    cy.get("input[id='verificationCode']").type("12345");
    cy.get("input[id='verificationCode']").clear(); // Trying to stop what I think is a timing error
    cy.get("input[id='verificationCode']").type("12345");
    cy.get("input[id='verificationCode']").should("have.value", "12345");
    cy.get("button[type='submit']").should("be.visible");
    cy.get("button[type='submit']").click();

    // TODO: Shows Terms and Conditions page currently..

    // Deactivated screen shows
    cy.url().should("contain", "/auth/account-deactivate");
    cy.get("h2").contains("Account deactivated");
    cy.get("a[href='/en/form-builder/support']").should("contain", "Contact support");
  });
});
