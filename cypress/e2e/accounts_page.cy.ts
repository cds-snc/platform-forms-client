describe("Accounts Page", () => {
  const adminUserEmail = "testadmin.user@cds-snc.ca";
  const testUserEmail = "test.user@cds-snc.ca";
  const deactivatedUserEmail = "test.deactivated@cds-snc.ca";

  beforeEach(() => {
    cy.login(true, true);
    cy.visitPage("/en/admin/accounts");
  });

  // Note: monitor perf of this. So far seems excellent!
  afterEach(() => {
    cy.resetAll();
  });

  it("Accounts page loads with title", () => {
    cy.get("h1").should("contain", "Accounts");
  });

  describe("Accounts tabs/filters and cards", () => {
    it("Clicking tabs/filters updates with expected content", () => {
      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(deactivatedUserEmail);

      cy.get("button").contains("Active").click();
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail);
      cy.get("ul[data-testid='accountsList'] li")
        .contains(deactivatedUserEmail)
        .should("not.exist");

      cy.get("button").contains("Deactivated").click();
      cy.get("ul[data-testid='accountsList'] li").contains(deactivatedUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail).should("not.exist");
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail).should("not.exist");
    });

    it("Clicking lock/unlock publishing of an account updates the button text state", () => {
      cy.get("button").contains("All").click();
      // Lock an account
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Lock publishing").click();
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Unlock publishing");

      // Unlock an account
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Unlock publishing").click();
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Lock publishing");
    });

    it("Clicking manage forms navigates to the related page", () => {
      cy.get("button").contains("All").click();
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Manage forms").click();
      cy.get("h1").contains("Manage forms");
    });

    it("Account deactivation updates the card and related tabs/filters lists correctly", () => {
      // Deactivate the test.user and check the tab states updated correctly
      cy.get("button").contains("All").click();
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("More").click();
      cy.get("div[role='menuitem']").contains("Deactivate account").click();
      cy.get("dialog").contains("Deactivate account").click();
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Reactivate account");

      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(deactivatedUserEmail);

      cy.get("button").contains("Active").click();
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail).should("not.exist");
      cy.get("ul[data-testid='accountsList'] li")
        .contains(deactivatedUserEmail)
        .should("not.exist");

      cy.get("button").contains("Deactivated").click();
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(deactivatedUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail).should("not.exist");

      // Reactivate the test.user account and check the tab states updated correctly
      cy.get("button").contains("All").click();
      cy.get(`li[data-testid="${testUserEmail}"]`).contains("Reactivate account").click();

      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(deactivatedUserEmail);

      cy.get("button").contains("Active").click();
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail);
      cy.get("ul[data-testid='accountsList'] li")
        .contains(deactivatedUserEmail)
        .should("not.exist");

      cy.get("button").contains("Deactivated").click();
      cy.get("ul[data-testid='accountsList'] li").contains(deactivatedUserEmail);
      cy.get("ul[data-testid='accountsList'] li").contains(testUserEmail).should("not.exist");
      cy.get("ul[data-testid='accountsList'] li").contains(adminUserEmail).should("not.exist");
    });
  });
});
