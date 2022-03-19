describe("Welcome Page", () => {
  beforeEach(() => {
    cy.visit("/en/welcome-bienvenue");
  });
  it("En page renders", () => {
    cy.get("h1").should("contain", "Welcome to Forms");
  });
  it("Change page language", () => {
    cy.get("button[lang='fr']").click();
    cy.url().should("contain", "/fr");
    cy.get("h1").should("contain", "Bienvenue aux formulaires GC");
  });
});
