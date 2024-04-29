describe("Test acceptable use Page", () => {
  beforeEach(() => {
    cy.userSession({ acceptableUse: false });
    cy.visitPage("/en/auth/policy");
  });

  it("En page renders proprerly", () => {
    cy.contains("h1", "Know your responsibilities");
    cy.get("[type='button']").should("contain.text", "Agree");
  });

  it("Fr page renders properly", () => {
    cy.switchLanguage("fr");

    cy.contains("h1", "Connaissez vos responsabilités");

    cy.get("[type='button']").should("contain.text", "Accepter");
  });

  it("Agree to the terms of use", () => {
    cy.visitPage("/en/auth/policy");

    cy.get("#acceptableUse").click();

    cy.location("pathname").should("eq", "/en/forms");
  });

  it("Redirects back to terms of use if not accepted", () => {
    cy.visitPage("/en/forms");
    cy.get("main").should("be.visible");
    cy.location("pathname").should("contain", "/en/auth/policy");
    cy.contains("h1", "Know your responsibilities");
  });
  it("Redirects back to calling page after acceptance", () => {
    cy.visitPage("/en/forms");
    cy.get("main").should("be.visible");
    cy.location("pathname").should("contain", "/en/auth/policy");
    cy.location("search").should("eq", "?referer=/en/forms");

    cy.get("#acceptableUse").click();

    cy.location("pathname").should("eq", "/en/forms");
  });
});
