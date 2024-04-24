export const ProfileRegularUser = () => {
  describe("User profile", () => {
    it("Can navigate to Profile page", () => {
      cy.visitPage("/en/forms");
      cy.get("button[id^='radix-']").click();
      cy.get("[data-testid='yourAccountDropdownContent']").contains("Profile").click();
      cy.url().should("include", "/profile");
      cy.get("h1").contains("Profile");
      cy.get("h2").first().contains("Account information");
      cy.get("h2").eq(1).contains("Security questions");
    });
    it("Redirects to user profile page if security questions are already completed", () => {
      cy.visitPage("/en/auth/setup-security-questions");
      cy.url().should("contain", "/en/profile");
      cy.get("h1").should("contain", "Profile");
      cy.get("h2").should("contain", "Security questions");
    });
    it("Renders the My Account dropdown as non-admin", () => {
      cy.visitPage("/en/forms");
      cy.get("[data-testid='yourAccountDropdownContent']").should("not.exist");
      cy.get("button[id^='radix-']").click();
      cy.get("[data-testid='yourAccountDropdownContent']").should("be.visible");
      cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Profile");
      cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Sign out");
      cy.get("[data-testid='yourAccountDropdownContent']").should("not.contain", "Administration");
    });
  });
};

export const ProfileAdminUser = () => {
  describe("User profile", () => {
    it("Can navigate to Profile page", () => {
      cy.visitPage("/en/forms");
      cy.get("button[id^='radix-']").click();
      cy.get("[data-testid='yourAccountDropdownContent']").contains("Profile").click();
      cy.url().should("include", "/profile");

      cy.get("h1").contains("Profile");
      cy.get("h2").first().contains("Account information");
      cy.get("h2").eq(1).contains("Security questions");
    });
    it("Renders the My Account dropdown as admin", () => {
      cy.visitPage("/en/forms");
      cy.get("[data-testid='yourAccountDropdownContent']").should("not.exist");
      cy.get("button[id^='radix-']").click();
      cy.get("[data-testid='yourAccountDropdownContent']").should("be.visible");
      cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Profile");
      cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Sign out");
      cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Administration");
    });
  });
};
