const FORM_ID_SINGLE_PAGE = "cm9h879wr007byn01fswmm9f3"; // staging = "cm9ha7ldb0001x701vocmtevr"
const FORM_ID_MULTI_PAGE = "cm9hg5nk6009rxa01dde41xes";

describe("Production Release Test", async () => {
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

  describe("Single Page Form", () => {
    beforeEach(() => {
      cy.visitPage(`/en/id/${FORM_ID_SINGLE_PAGE}`);
    });

    it("Shows header language picker, title and footer", () => {
      cy.get("header").should("contain", "Français");
      cy.get("h1").should("contain", "test-kitchen-sink-single-page");
      cy.get("footer").should("contain", "Terms and conditions");
    });

    it("Missing required questions or invalid input causes form validation to show", () => {
      cy.typeInField("#16", "invalid@email");
      // Date
      cy.get("#13-year").type("1");
      cy.get("#13-month").type("1");
      cy.get("#13-day").type("1");
      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h2").should("contain", "Please correct the errors on the page");
      cy.get("#errorMessage16").should("contain", "Enter a valid email address");
      cy.get("#errorMessage13").should("contain", "Enter a valid date");
    });

    it("Filling only required fields succeeds", () => {
      // Attestation
      cy.get("div[data-testid='7.0']").find("label").click();
      cy.get("div[data-testid='7.1']").find("label").click();
      cy.get("div[data-testid='7.2']").find("label").click();

      // Name and Full name
      cy.typeInField("#8", "full name");
      cy.typeInField("#10", "first");
      cy.typeInField("#12", "last");

      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h1").should("contain", "Your form has been submitted");
    });

    it("Filling all fields succeeds", () => {
      cy.typeInField("#1", "test");
      cy.typeInField("#2", "test");
      cy.get("label[for='3.0']").click();
      cy.get("label[for='4.0']").click();
      cy.get("#5").select("B").should("have.value", "B");

      // Show hide
      cy.get("label[for='26.0']").click();
      cy.get("#label-27").should("contain", "Question A");
      cy.get("label[for='26.1']").click();
      cy.get("#label-28").should("contain", "Question B");

      // Attestation
      cy.get("div[data-testid='7.0']").find("label").click();
      cy.get("div[data-testid='7.1']").find("label").click();
      cy.get("div[data-testid='7.2']").find("label").click();

      // Name and Full name
      cy.typeInField("#8", "full name");
      cy.typeInField("#10", "first");
      cy.typeInField("#11", "first");
      cy.typeInField("#12", "last");

      // Date
      cy.get("#13-year").type("2023");
      cy.get("#13-month").type("01");
      cy.get("#13-day").type("01");

      // Contact
      cy.typeInField("#15", "TODO Phone number may want to restrict more");
      cy.typeInField("#16", "valid@email.com");
      cy.get("label[for='17.0']").click();

      // Address
      cy.typeInField("#19", "Street");
      cy.typeInField("#20", "City");
      cy.typeInField("#21", "Province");
      cy.typeInField("#22", "Postal code");

      // Department
      cy.typeInField("#23", "Accessibility Standards Canada").should(
        "have.value",
        "Accessibility Standards Canada"
      );

      // Number
      cy.typeInField("#24", "123");

      // TODO - file picker?

      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h1").should("contain", "Your form has been submitted");
    });
  });

  describe("Multi-Page Form", () => {
    beforeEach(() => {
      cy.visitPage(`/en/id/${FORM_ID_MULTI_PAGE}`);
    });

    it("Shows header language picker, title and footer", () => {
      cy.get("header").should("contain", "Français");
      cy.get("h1").should("contain", "test-kitchen-sink-multi-page");
      cy.get("footer").should("contain", "Terms and conditions");
    });

    it("Missing required questions or invalid input causes form validation to show", () => {
      cy.get("span").contains("Continue").parent().click();

      // Applicant Information page
      cy.get("h2").should("contain", "Applicant Information");
      cy.get("span").contains("Continue").parent().click();
      cy.get("h2").should("contain", "Please correct the errors on the page");
    });

    it("Filling only required fields succeeds", () => {
      cy.get("span").contains("Continue").parent().click();

      // Applicant Information page
      cy.get("h2").should("contain", "Applicant Information");
      cy.typeInField("#16", "first");
      cy.typeInField("#18", "last");
      cy.typeInField("#20", "Accessibility Standards Canada").should(
        "have.value",
        "Accessibility Standards Canada"
      );

      cy.get("span").contains("Continue").parent().click();

      cy.get("label[for='22.0']").click();

      // Next next...
      cy.get("span").contains("Continue").parent().click();
      cy.get("span").contains("Continue").parent().click();
      cy.get("span").contains("Continue").parent().click();
      cy.get("span").contains("Continue").parent().click();

      cy.get("h2").should("contain", "Review your answers before submitting the form");

      cy.get("button[type='submit']").click();
      clickFormTimer();
      cy.get("h1").should("contain", "Your form has been submitted");
    });
  });
});
