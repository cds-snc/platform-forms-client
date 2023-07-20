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

import flagsDefault from "../../../flag_initialization/default_flag_settings.json";

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
      !alreadyAuth && cy.login({ admin: true });
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

Cypress.Commands.add("login", (options?: { admin?: boolean; acceptableUse?: boolean }) => {
  const { admin = false, acceptableUse = false } = options || {};
  cy.request({
    method: "GET",
    url: "/api/auth/csrf",
  }).then((response) => {
    expect(response.body).to.have.property("csrfToken");
    const { csrfToken } = response.body;
    cy.request({
      method: "POST",
      url: "/api/auth/signin/cognito",
      form: true,
      body: {
        username: `test.${admin ? "admin" : "user"}@cds-snc.ca`,
        password: "testing",
        csrfToken,
      },
    }).then((response) => {
      expect(response.body).to.have.property("status", "success");
      expect(response.body).to.have.property("challengeState", "MFA");
      expect(response.body).to.have.property("authenticationFlowToken");

      cy.request({
        method: "POST",
        url: "/api/auth/callback/cognito",
        form: true,
        body: {
          username: `test.${admin ? "admin" : "user"}@cds-snc.ca`,
          verificationCode: "123456",
          authenticationFlowToken: response.body.authenticationFlowToken,
          csrfToken,
          json: true,
        },
      }).then(() => {
        // Ensure cookie is created
        cy.waitUntil(() =>
          cy.getCookie("next-auth.session-token").then((cookie) => Boolean(cookie && cookie.value))
        );
        if (acceptableUse) {
          cy.request({
            method: "POST",
            url: "/api/acceptableuse",
            headers: {
              "x-csrf-token": csrfToken,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        }
      });
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
      cy.waitUntil(() =>
        cy.getCookie("next-auth.session-token").then((cookie) => !cookie || !cookie.value)
      );
    });
  });
});

/**
 * Reset the database to it's default state
 */
Cypress.Commands.add("resetDB", () => {
  cy.task("db:teardown");
  cy.task("db:seed");
});

/**
 * Reset the flags to default values
 */
Cypress.Commands.add("resetFlags", () => {
  cy.login()
    .then(() => {
      Object.keys(flagsDefault).forEach((key) => {
        cy.useFlag(`${key}`, (flagsDefault as Record<string, boolean>)[key], true);
      });
    })
    .then(() => cy.logout());
});

/**
 * Reset the database and flags to their default values
 */
Cypress.Commands.add("resetAll", () => {
  cy.task("db:teardown");
  cy.task("db:seed");
  cy.login()
    .then(() => {
      Object.keys(flagsDefault).forEach((key) => {
        cy.useFlag(`${key}`, (flagsDefault as Record<string, boolean>)[key], true);
      });
    })
    .then(() => cy.logout());
});
