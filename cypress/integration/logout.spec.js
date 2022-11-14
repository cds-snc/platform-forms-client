describe("Logout Page test", () => {
  beforeEach(() => {
    cy.visit("/en/auth/logout");
  });

  it("Display french page version", () => {
    cy.get("button[lang='fr']").click();
    cy.get("h2").should("contain", "Vous avez fermé votre session");
    cy.get("div[id=login-menu]").should("contain", "Se connecter");
  });

  it("Toggle page language to en", () => {
    cy.get("h2").should("contain", "You are signed out");
    cy.get("div[id=login-menu]").should("contain", "Sign in");
  });

  it("Go to login page", () => {
    cy.get("div[id=login-menu]>a").click();
    cy.url().should("contain", "/en/auth/login");
    cy.get("h1").should("contain", "Sign In");
  });
});
