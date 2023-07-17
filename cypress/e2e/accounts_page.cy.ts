// TODO update tests to use the below for clicking buttons and pannels, avoids future problem with adding new users
// const adminUserEmail = "testadmin.user@cds-snc.ca";
// const testUserEmail = "test.user@cds-snc.ca";

//TODO: use data-testid's for more stable selectors in the future e.g. instead of searching for text "All"

describe("Accounts Page", () => {
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

  // NOTE: these tests assume TWO accounts in the system. If you add another user, update the length checks
  describe("Accounts tabs/filters and cards", () => {
    it("Clicking tabs/filters update with expected content", () => {
      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 2);

      cy.get("button").contains("Active").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 2);

      cy.get("button").contains("Deactivated").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 0);
    });

    it("Clicking lock/unlock of an account updates the button text state", () => {
      cy.get("button").contains("All").click();
      // Lock an account
      cy.get("ul[data-testid='accountsList'] li").last().contains("Lock publishing").click();

      //Unlock an account
      cy.get("ul[data-testid='accountsList'] li").last().contains("Unlock publishing");
    });

    it("Clicking manage forms navigates to the related page", () => {
      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").last().contains("Manage forms").click();
      cy.get("h1").contains("Manage forms");
    });

    it("Account deactivation updates the card and related tabs/filters lists correctly", () => {
      // Deactivate account
      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").last().contains("More").click();
      cy.get("div[role='menuitem']").contains("Deactivate account").click();
      cy.get("dialog").contains("Deactivate account").click();
      cy.get("ul[data-testid='accountsList'] li").last().contains("Reactivate account");

      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 2);

      cy.get("button").contains("Active").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 1);

      cy.get("button").contains("Deactivated").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 1);

      // Reactivate account
      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").last().contains("Reactivate account").click();

      cy.get("button").contains("All").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 2);

      cy.get("button").contains("Active").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 2);

      cy.get("button").contains("Deactivated").click();
      cy.get("ul[data-testid='accountsList'] li").should("have.length", 0);
    });
  });
});
