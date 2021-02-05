describe("Welcome Page", { baseUrl: "http://localhost:3000" }, () => {
  it("En page renders", () => {
    cy.visit("/en");
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
