describe("Terms and Conditions Page", () => {
  beforeEach(() => {
    cy.visit("/en/terms-avis");
  });
  it("Get page content", () => {
    cy.get("h1").should("contain", "Terms and conditions");
  });
  it("Change page language to French", () => {
    cy.get("button[lang='fr']").click();
    cy.url().should("contain", "/fr");
    cy.get("h1").should("contain", "Avis");
  });
});
