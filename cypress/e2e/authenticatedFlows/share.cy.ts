describe("Form builder share", () => {
  describe("Authenticated", () => {
    beforeEach(() => {
      cy.userSession();
      cy.visitPage("/en/form-builder/0000/edit");
    });

    it("Renders share flyout with name check", () => {
      cy.get("button").contains("Share").click();
      cy.get("[role='menuitem']").should("have.length", 1);
      cy.get("[role='menuitem']").contains("You must").should("be.visible");
      cy.get("[role='menuitem'] span").contains("name your form").click();
      cy.focused().should("have.attr", "id", "fileName");
    });
    it("Renders share flyout for authenticated", () => {
      cy.get("#fileName").should("have.attr", "placeholder", "Unnamed form file");
      cy.typeInField("#fileName", "Cypress Share Test Form");
      cy.get("button").contains("Share").click();
      cy.get("[role='menuitem']").should("have.length", 1);
      cy.get("span").contains("Share by email").click();
      cy.get("dialog label").contains("Email address");
      cy.get("summary").contains("See a preview of the email message").should("exist").click();
      cy.get("h4")
        .contains("Regular Test User has shared a form with you on GC Forms")
        .should("exist");
      cy.get("[data-testid='close-dialog']").click();
    });
  });
  describe("UnAuthenticated", () => {
    beforeEach(() => {
      cy.visitPage("/en/form-builder/0000/edit");
    });
    it("Renders share flyout for unAuthenticated", () => {
      cy.get("#fileName")
        .should("have.attr", "placeholder", "Unnamed form file")
        .type("Cypress Share Test Form");
      cy.get("button").contains("Share").click();
      cy.get("[role='menuitem']").should("have.length", 1);
      cy.get("span").contains("Share by email").click();
      // Using "exist" instead of "be.visible" because the content is hidden by scolling
      cy.get("dialog").contains("Step 1").should("exist");
      cy.get("button").contains("Download form file").should("exist");
      cy.get("button").contains("Copy instructions").should("exist");
      cy.get("summary").contains("See a preview of the email message").should("exist").click();
      cy.get("h4")
        .contains("A GC Forms user has shared a form with you on GC Forms")
        .should("exist");
      cy.get("button").contains("Close").click();
    });
  });
});
