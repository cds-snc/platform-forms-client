describe("Logout Page test", () => {
  beforeEach(() => {
    cy.visit("/en/auth/logout");
  });

  it("Display french page version", () => {
    cy.get("button[lang='fr']").click();
    cy.get("h2").should("contain", "Vous avez fermé votre session");
    cy.get("[id=login-button]").should("contain", "Se connecter");
  });

  it("Toggle page language to en", () => {
    cy.get("h2").should("contain", "You are signed out");
    cy.get("[id=login-button").should("contain", "Go to Login");
  });

  it("Go to login page", () => {
    cy.get("[id=login-button").click();
    cy.url().should("contain", "/en/auth/login");
    cy.get("h1").should("contain", "Sign In");
  });
});
