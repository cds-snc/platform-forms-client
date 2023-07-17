describe("Deactivated Page", () => {
  afterEach(() => {
    cy.resetAll();
  });

  it("Deactivate user and test deactivated users in one step so user state saved", () => {
    // Deactivate the test user as the admin user
    cy.login(true, true);
    cy.visitPage("/en/admin/accounts");
    cy.get("ul[data-testid='accountsList'] li").last().contains("More").click();
    cy.get("div[role='menuitem']").contains("Deactivate account").click();
    cy.get("dialog").contains("Deactivate account").click();
    cy.get("ul[data-testid='accountsList'] li").last().contains("Reactivate account");
    cy.logout();
    cy.visitPage("/en/auth/logout");

    // Manually log in the deactivated test user
    // cy.visit("/auth/login");
    cy.visitPage("/en/auth/login");
    // cy.contains("Sign in").click();
    cy.get("input[id='username']").type("test.user@cds-snc.ca");
    cy.get("input[id='password']").type("testTesttest");
    cy.get("button[type='submit']").click();

    // Do  2FA
    cy.get("input[id='verificationCode']").should("be.visible");
    cy.get("input[id='verificationCode']").type("12345"); // Trying to stop what I think is a timing error
    cy.get("input[id='verificationCode']").clear();
    cy.get("input[id='verificationCode']").type("12345");
    cy.get("input[id='verificationCode']").should("have.value", "12345");
    cy.get("button[type='submit']").should("be.visible");
    cy.get("button[type='submit']").click();

    // Deactivated screen shows
    cy.url().should("contain", "auth/account-deactivate");
    cy.get("h2").contains("Account deactivated");
    cy.get("a[href='/en/form-builder/support']").should("contain", "Contact support");
  });
});
