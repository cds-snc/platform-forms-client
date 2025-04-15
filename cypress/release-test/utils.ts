export const ignoreExceptions = () =>
  Cypress.on("uncaught:exception", (err) => {
    // See https://docs.cypress.io/api/cypress-api/catalog-of-events#Uncaught-Exceptions
    if (err.message.includes("Minified React error #418")) {
      return false;
    }
  });

// Set to false if the form timer is not enabled
const formTimer = true;
export const clickFormTimer = () => {
  if (formTimer) {
    cy.get("p").should("contain", "The button is ready.");
    cy.get("button[type='submit']").click();
  }
};

// Set to false if hCAPTCHA is enabled
const submitForm = true;
export const clickAndTestSubmit = (doFormTimer = true) => {
  if (submitForm) {
    cy.get("button[type='submit']").click();
    if (doFormTimer) {
      clickFormTimer();
    }
    cy.get("h1").should("contain", "Your form has been submitted");
  }
};
