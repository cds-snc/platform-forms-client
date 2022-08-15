describe("Acceptable use Page", () => {
  beforeEach(() => {
    cy.visit("/en/auth/policy");
  });

  it("En page renders proprerly", () => {
    cy.get("h1").should("contain", "Welcome back");
    cy.get(".gc-agree-btn").should("be.visible");
    cy.get(".gc-cancel-btn").should("be.visible");
    cy.get(".gc-acceptable-use-header").should("be.visible");
  });

  it("Fr page renders properly", () => {
    cy.get("button[lang='fr']").click();
    cy.url().should("contain", "/fr");
    cy.get("h1").should("contain", "Content de vous revoir");
    cy.get(".gc-agree-btn").should("be.visible");
    cy.get(".gc-cancel-btn").should("be.visible");
    cy.get(".gc-acceptable-use-header").should("be.visible");
  });

  it("Accept terms of use", () => {
    cy.get(".gc-agree-btn").click();
    cy.intercept("POST", "/api/acceptableuse*", { statusCode: 200 });
  });

  it("Cancel terms of use", () => {
    cy.get(".gc-cancel-btn").click();
    cy.url().should("contain", "/logout");
  });
});
