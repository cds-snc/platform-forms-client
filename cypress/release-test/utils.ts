export const ignoreExceptions = () =>
  Cypress.on("uncaught:exception", (err) => {
    // See https://docs.cypress.io/api/cypress-api/catalog-of-events#Uncaught-Exceptions
    if (err.message.includes("Minified React error #418")) {
      return false;
    }
  });

const submitForm = true;
const formTimer = true;

export const submitFormSuccess = (formTimerOverride = true) => {
  if (submitForm) {
    cy.get("button[type='submit']").click();

    if (formTimer && formTimerOverride) {
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();
    }

    cy.get("h1").should("contain", "Your form has been submitted");
  }
};

export const submitFormValidation = (formTimerOverride = true) => {
  if (submitForm) {
    cy.get("button[type='submit']").click();

    if (formTimer && formTimerOverride) {
      cy.get("p").should("contain", "The button is ready.");
      cy.get("button[type='submit']").click();
    }

    cy.get("h2").should("contain", "Please correct the errors on the page");
  }
};
