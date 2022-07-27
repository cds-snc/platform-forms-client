describe("Logout Page test", () => {
  beforeEach(() => {
    cy.visit("/fr/auth/logout");
  });

  it("Display french page version", () => {
    cy.get("h2").should("contain", "Vous êtes déconnecté.");
    cy.get("h4").should("contain", "Votre derniere session de connexion");
    cy.get("[data-testid='goToLogin']").should("contain", "Connectez-vous");
  });

  it("Toggle page language to en", () => {
    cy.get("button[lang='en']").click();
    cy.get("h2").should("contain", "You are signed out");
    cy.get("h4").should("contain", "Your last session ended at");
    cy.get("[data-testid='goToLogin']").should("contain", "Go to login");
  });

  //TODO for sake of completeness enable this test when login page is available.
  it.skip("Go to login page", () => {
    cy.get("[data-testid='goToLogin']").click();
    cy.url().should("contain", "/auth/login");
    cy.get("h1").should("contain", "Sign in");
  });
});
