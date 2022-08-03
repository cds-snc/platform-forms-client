describe("Acceptance use Page", () => {
  beforeEach(() => {
    cy.visit("/en/auth/policy");
  });
  it("En page renders", () => {
    cy.get("h1").should("contain", "Welcome back");
  });
  it("Change page language", () => {
    cy.get("button[lang='fr']").click();
    cy.url().should("contain", "/fr");
    cy.get("h1").should("contain", "Content de vous revoir");
  });
});
