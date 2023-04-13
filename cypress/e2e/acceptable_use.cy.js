describe("Test acceptable use Page", () => {
  beforeEach(() => {
    cy.login();
    cy.visitPage("/en/auth/policy");
  });
  afterEach(() => {
    cy.logout();
  });

  it("En page renders proprerly", () => {
    cy.get("h1").should("contain", "Know your responsibilities");
    cy.get("[type='button']").should("contain.text", "Agree");
  });

  it("Fr page renders properly", () => {
    cy.get("a[lang='fr']").click();
    cy.url().should("contain", "/fr");
    // Ensure page has fully loaded
    cy.get("main").should("be.visible");
    cy.get("h1").should("contain", "Connaissez vos responsabilités");
    cy.get("[type='button']").should("contain.text", "Accepter");
  });

  it("Agree to the terms of use", () => {
    cy.get("#acceptableUse").click();
    cy.url().should("contain", "/myforms");
  });

  it("Redirects back to terms of use if not accepted", () => {
    cy.visitPage("/myforms");
    cy.url().should("contain", "/auth/policy");
  });
  it("Redirects back to calling page after acceptance", () => {
    cy.visitPage("/myforms");
    cy.url().should("contain", "/auth/policy");
    cy.url().should("contain", "?referer=/myforms");
    cy.get("#acceptableUse").click();
    cy.url().should("contain", "/myforms");
  });
});
