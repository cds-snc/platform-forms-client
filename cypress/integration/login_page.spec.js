describe("Login Page", () => {
  describe("Bearer Token State", () => {
    beforeEach(() => {
      cy.visit("/en/auth/login");
    });

    it("EN page renders", () => {
      cy.get("h1").should("contain", "Sign in");
      cy.get("[data-testid='loginEmail']");
      cy.get("[data-testid='signInKey']");
    });

    it("Change page language", () => {
      cy.get("button[lang='fr']").click();
      cy.url().should("contain", "/fr");
      cy.get("h1").should("contain", "Se connecter");
    });

    it("Displays an error message when submitting an empty form.", () => {
      cy.get("[type='submit']").click();
      cy.get("[data-testid='alert']").should("be.visible");
    });

    it("Displays an error message when submitting a form and getting an unsuccessful reply from the server.", () => {
      cy.intercept("POST", "/api/token/temporary", {
        statusCode: 403,
      }).as("userSuccess");
      cy.get("input[id='loginEmail']").type("test@cds-snc.ca");
      cy.get("[type='submit']").click();
      cy.get("[data-testid='alert']").should("be.visible");
    });
  });

  describe("Temporary Token State", () => {
    it("Submits good bearer token and displays the temporary token state", () => {
      cy.visit("/en/auth/login");
      cy.intercept("POST", "/api/token/temporary", {
        statusCode: 200,
      }).as("userSuccess");
      cy.get("input[id='loginEmail']").type("test@cds-snc.ca");
      cy.get("textarea[id='signInKey']").type("fAkE_sIgN_iN_kEy");
      cy.get("[type='submit']").click();
    });
    it("Displays the temporary token state after a successful response", () => {
      cy.get("[data-testid='alert']").should("not.exist");
    });
    it("Displays an error when entering an invalid temporary token", () => {
      cy.get("[type='submit']").click();
      cy.get("[data-testid='alert']").should("be.visible");
    });
  });
});
