describe("User profile", () => {
  it("Renders the My Account dropdown as non-admin", () => {
    cy.login({ acceptableUse: true });
    cy.visit("/en/myforms");
    cy.get("[data-testid='yourAccountDropdownContent']").should("not.exist");
    cy.get("button[id^='radix-']").click();
    cy.get("[data-testid='yourAccountDropdownContent']").should("be.visible");
    cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Profile");
    cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Sign out");
    cy.get("[data-testid='yourAccountDropdownContent']").should("not.contain", "Administration");
  });

  it("Renders the My Account dropdown as admin", () => {
    cy.login({ admin: true, acceptableUse: true });
    cy.visit("/en/myforms");
    cy.get("[data-testid='yourAccountDropdownContent']").should("not.exist");
    cy.get("button[id^='radix-']").click();
    cy.get("[data-testid='yourAccountDropdownContent']").should("be.visible");
    cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Profile");
    cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Sign out");
    cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Administration");
  });

  it("Can navigate to Profile page", () => {
    cy.login({ acceptableUse: true });
    cy.visit("/en/myforms");
    cy.get("button[id^='radix-']").click();
    cy.get("[data-testid='yourAccountDropdownContent']").contains("Profile").click();
    cy.url().should("include", "/profile");

    cy.get("h1").contains("Profile");
    cy.get("h2").first().contains("Account information");
    cy.get("h2").eq(1).contains("Security questions");
  });
});
