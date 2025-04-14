const FORM_ID_NO_GROUPS = "cm9h879wr007byn01fswmm9f3";
// const FORM_ID_GROUPS = "cm9brytyb002cyn0131vmvzsm"; // TODO

describe("Production test", async () => {
  // TODO: remove or disable when form-timer removed
  const formTimer = true;
  const clickFormTimer = () => {
    if (formTimer) {
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();
    }
  };

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

    it("Shows header language picker, title and footer", () => {
      cy.get("header").should("contain", "Français");
      cy.get("h1").should("contain", "test-kitchen-sink-single-page");
      cy.get("footer").should("contain", "Terms and conditions");
    });

    it("Missing required questions causes form validation to show", () => {
      cy.typeInField("#1", "test");
      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h2").should("contain", "Please correct the errors on the page");
    });

    // it("Filling in required fields succeeds", () => {
    //   cy.typeInField("#1", "test");

    //   // cy.get("#7").first().check();
    //   // cy.get("#7").eq(1).check();
    //   // cy.get("#7").eq(2).check();

    //   clickFormTimer();
    //   cy.get("h2").should("contain", "Please correct the errors on the page");
    // });
  });
});
