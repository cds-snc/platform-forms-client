/** Hard to find a way to hack requireAuthentication
 * a wrapper around policy and retrieval page.We will keep this file
 * for reference til suitable approach is found.
 **/
describe("Acceptable use Page", () => {
  beforeEach(() => {
    cy.visit("/en/auth/policy");
  });

  it.skip("En page renders proprerly", () => {
    cy.get("h1").should("contain", "Welcome back");
    cy.get(".gc-agree-btn").should("be.visible");
    cy.get(".gc-cancel-btn").should("be.visible");
    cy.get(".gc-acceptable-use-header").should("be.visible");
  });

  it.skip("Fr page renders properly", () => {
    cy.get("button[lang='fr']").click();
    cy.url().should("contain", "/fr");
    cy.get("h1").should("contain", "Content de vous revoir");
    cy.get(".gc-agree-btn").should("be.visible");
    cy.get(".gc-cancel-btn").should("be.visible");
    cy.get(".gc-acceptable-use-header").should("be.visible");
  });

  it.skip("Cancel terms of use", () => {
    cy.get(".gc-cancel-btn").click();
    cy.url().should("contain", "/logout");
  });
});
