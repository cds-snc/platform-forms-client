const FORM_ID_NO_GROUPS = "cm9bqn9ic002dxa015vna935r";
const FORM_ID_GROUPS = "cm9brytyb002cyn0131vmvzsm";

describe("Production test", () => {
  Cypress.on("uncaught:exception", (err) => {
    // See https://docs.cypress.io/api/cypress-api/catalog-of-events#Uncaught-Exceptions
    if (err.message.includes("Minified React error #418")) {
      return false;
    }
  });

  describe("Landing page", () => {
    it("English page loads", () => {
      cy.visitPage("/");
      cy.get("h1").should("contain", "GC Forms");
    });

    it("French page loads", () => {
      cy.visitPage("/fr");
      cy.get("h1").should("contain", "Formulaires GC - GC Forms");
    });
  });

  describe("Submit a non-groups form", () => {
    beforeEach(() => {
      cy.visitPage(`/en/id/${FORM_ID_NO_GROUPS}`);
    });

    it("Valid submission - should pass", () => {
      cy.get("h1").should("contain", "smoke-test-non-groups");
      cy.typeInField("#1", "test");
      cy.typeInField("#2", "test");
      cy.get("button[type='submit']").click();

      // Remove when form-timer turned off
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();

      cy.get("h1").contains("Your form has been submitted");
    });

    it("Invalid submission - missing required field", () => {
      cy.get("h1").should("contain", "smoke-test-non-groups");
      cy.typeInField("#2", "test");
      cy.get("button[type='submit']").click();

      // Remove when form-timer turned off
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();

      cy.get("h2").should("contain", "Please correct the errors on the page");
    });
  });

  describe("Submit a groups form", () => {
    beforeEach(() => {
      cy.visitPage(`/en/id/${FORM_ID_GROUPS}`);
    });

    it("Valid submission - should pass", () => {
      cy.get("h1").should("contain", "smoke-test-groups");

      // TODO
    });
  });
});
