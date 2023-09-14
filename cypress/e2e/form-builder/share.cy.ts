describe("Form builder share", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder/edit");
  });

  it("Renders share flyout with name check", () => {
    cy.get("button").contains("Share").click();
    cy.get("[role='menuitem']").should("have.length", 1);
    cy.get("[role='menuitem']").contains("You must").should("be.visible");
    cy.get("[role='menuitem'] span").contains("name your form").click();
    cy.focused().should("have.attr", "id", "fileName");
  });
  it("Renders share flyout for authenticated", () => {
    cy.typeInField("#fileName", "Cypress Share Test Form");
    cy.get("button").contains("Share").click();
    cy.get("[role='menuitem']").should("have.length", 1);
    cy.get("span").contains("Share by email").click();
    cy.get("dialog label").contains("Email address");
    cy.get("summary").contains("See a preview of the email message").should("be.visible").click();
    cy.get("h4")
      .contains("Regular Test User has shared a form with you on GC Forms")
      .should("be.visible");
    cy.get("button").contains("Close").click();
  });
  it("Renders share flyout for unAuthenticated", () => {
    cy.logout();
    cy.visitPage("/form-builder/edit");
    cy.typeInField("#fileName", "Cypress Share Test Form");
    cy.get("button").contains("Share").click();
    cy.get("[role='menuitem']").should("have.length", 1);
    cy.get("span").contains("Share by email").click();
    cy.get("dialog").contains("Step 1").should("be.visible");
    cy.get("button").contains("Download form file").should("be.visible");
    cy.get("button").contains("Copy instructions").should("be.visible");
    cy.get("summary").contains("See a preview of the email message").should("be.visible").click();
    cy.get("h4")
      .contains("A GC Forms user has shared a form with you on GC Forms")
      .should("be.visible");
    cy.get("button").contains("Close").click();
  });
});
