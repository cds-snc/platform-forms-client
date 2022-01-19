describe("Welcome Page", () => {
  it("En page renders", () => {
    cy.visit("/en/welcome-bienvenue");
    cy.get("h1").should("contain", "Welcome to Forms");
  });
  it("Change page language", () => {
    cy.get("button[lang='fr']").click();
    cy.url().should("contain", "/fr");
  });
  it("Fr page renders", () => {
    cy.get("h1").should("contain", "Bienvenue aux formulaires GC");
  });
});
