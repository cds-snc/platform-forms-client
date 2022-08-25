describe("Logout Page test", () => {
  beforeEach(() => {
    cy.visit("/en/auth/logout");
  });

  it("Display french page version", () => {
    cy.get("button[lang='fr']").click();
    cy.get("h2").should("contain", "Vous êtes déconnecté.");
    cy.get(".gc-last-logout-time").should("contain", "Votre dernière session de connexion");
    cy.get(".gc-login-menu").find("a").should("contain", "Connexion");
    cy.get(".gc-go-to-login-btn").should("be.visible");
  });

  it("Toggle page language to en", () => {
    cy.get("h2").should("contain", "You are signed out");
    cy.get(".gc-last-logout-time").should("contain", "Your last session ended at");
    cy.get(".gc-go-to-login-btn").find("a").should("contain", "Go to login");
  });

  it("Go to login page", () => {
    cy.get(".gc-go-to-login-btn").find("a").click();
    cy.url().should("contain", "/en/auth/login");
    cy.get("h1").should("contain", "Sign in");
  });
});
