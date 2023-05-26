// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/**
 * Creates a Template in the Database with the provided fixture
 * @param file JSON fixture file
 */
Cypress.Commands.add("useForm", (file) => {
  cy.login();
  cy.fixture(file).then((mockedForm) => {
    cy.request({
      method: "POST",
      url: "/api/templates",
      body: {
        formConfig: mockedForm,
      },
    }).then((response) => {
      expect(response.body).to.have.property("id");
      cy.wrap(response.body.id).as("formID", { type: "static" });
    });
  });
  cy.logout();
});

/**
 * Navigate to the fixture created in useForm
 */
Cypress.Commands.add("visitForm", (formID) => {
  cy.visit(`/id/${formID}`);
  // Ensure page has fully loaded
  cy.get("main").should("be.visible");
});

/**
 * Navigate to a page and wait for it to load
 */
Cypress.Commands.add("visitPage", (path) => {
  cy.visit(path);
  // Ensure page has fully loaded
  cy.get("main").should("be.visible");
});

/**
 * Set an application flag
 * @param flagName The name of the flag to modify
 * @param value Boolean value to set the value of the flag
 * @param alreadyAuth Is a user already logged in with correct permissions
 */
Cypress.Commands.add("useFlag", (flagName, value, alreadyAuth) => {
  cy.request({
    method: "GET",
    url: `/api/flags/${flagName}/check`,
  }).then(({ body: { status } }) => {
    if (status !== value) {
      !alreadyAuth && cy.login();
      cy.request({
        method: "GET",
        url: `/api/flags/${flagName}/${value ? "enable" : "disable"}`,
      });
      !alreadyAuth && cy.logout();
    }
  });
});

/**
 * Log the test user into the application
 */

Cypress.Commands.add("login", () => {
  cy.request({
    method: "GET",
    url: "/api/auth/csrf",
  }).then((response) => {
    expect(response.body).to.have.property("csrfToken");
    const { csrfToken } = response.body;
    cy.request({
      method: "POST",
      url: "/api/auth/callback/credentials",
      form: true,
      body: {
        username: "test.user@cds-snc.ca",
        password: "testing",
        redirect: false,
        csrfToken,
        callbackUrl: "http://localhost:3000/en/auth/login",
        json: true,
      },
    }).then(() => {
      // Ensure cookie is created
      cy.waitUntil(() => cy.getCookie("next-auth.session-token").then((cookie) => !!cookie));
    });
  });
});

/**
 * Logout the test user from the application
 */
Cypress.Commands.add("logout", () => {
  cy.request({
    method: "GET",
    url: "/api/auth/csrf",
  }).then((response) => {
    expect(response.body).to.have.property("csrfToken");
    const { csrfToken } = response.body;
    cy.request({
      method: "POST",
      url: "/api/auth/signout",
      form: true,
      body: {
        csrfToken,
        callbackUrl: "/en/auth/logout",
        json: true,
      },
    }).then(() => {
      // Ensure cookie is removed
      cy.waitUntil(() => cy.getCookie("next-auth.session-token").then((cookie) => !cookie));
    });
  });
});
