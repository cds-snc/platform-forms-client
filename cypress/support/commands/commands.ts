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

Cypress.Commands.add("useForm", (file, published = true) => {
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
      if (published) {
        cy.request({
          method: "PUT",
          url: `/api/templates/${response.body.id}`,
          body: {
            isPublished: true,
          },
        });
      }
    });
  });
  cy.logout();
});

/**
 * Navigate to the fixture created in useForm
 */
Cypress.Commands.add("visitForm", (formID, language = "en") => {
  cy.visitPage(`/${language}/id/${formID}`);
});

/**
 * Navigate to a page and wait for it to load
 */
Cypress.Commands.add("visitPage", (path) => {
  cy.waitForNetworkIdlePrepare({
    method: "GET",
    pattern: "/api/*",
    alias: "calls",
  });
  cy.visit(path);
  // Ensure page has fully loaded
  cy.get("div[data-testid='loading-spinner']").should("not.exist");
  cy.get("main").should("be.visible");
  // Ensure network calls have ended that drive renders
  cy.waitForNetworkIdle("@calls", 1000);
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
        cy.waitUntil(
          () =>
            cy.getCookie("authjs.session-token").then((cookie) => Boolean(cookie && cookie.value)),
          { timeout: 10000, interval: 500 }
        );

        let session;
        if (acceptableUse) {
          cy.request({
            method: "GET",
            url: "/api/auth/session",
          })
            .then((response) => {
              session = response.body;
              return session;
            })
            .then((session) => {
              cy.request({
                method: "POST",
                url: "/api/auth/session",
                headers: {
                  "x-csrf-token": csrfToken,
                },
                body: {
                  csrfToken,
                  data: { ...session, user: { ...session.user, acceptableUse: true } },
                },
              }).then((response) => {
                expect(response.status).to.eq(200);
                cy.visit("/en/forms");
              });
            });
        }
      });
    });
  });
});

Cypress.Commands.add("securityQuestions", () => {
  cy.get("h1").contains("Set up security questions");
  cy.get("#question1").select("What was your favourite school subject?");
  cy.typeInField("#answer1", "example-answer-1");
  cy.get("#question2").select("What was the name of your first manager?");
  cy.typeInField("#answer2", "example-answer-2");
  cy.get("#question3").select("What was the make of your first car?");
  cy.typeInField("#answer3", "example-answer-3");
  cy.contains("Continue").click();
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
      cy.clearCookie("authjs.session-token");

      cy.waitUntil(
        () =>
          cy
            .request({ method: "GET", url: "/api/auth/session" })
            .then((response) => response.body === null),
        { timeout: 10000, interval: 500 }
      );

      // cy.waitUntil(
      //   () => cy.getCookie("authjs.session-token").then((cookie) => !cookie || !cookie.value),
      //   { timeout: 10000, interval: 500 }
      // );
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

/**
 * Type in a field and wait for the field to be updated
 */
Cypress.Commands.add("typeInField", (field, typedText, outputText) => {
  cy.get(field).type(typedText, { delay: 50 });

  // Use passed in outputText or Remove actions in brackets from typedText
  const text = outputText ?? typedText.replace(/\{.*\}/, "");

  // If there is text to verify and not just an action
  if (text) {
    cy.get(field).then(($el) => {
      if ($el.attr("value") !== undefined) {
        cy.get(field).should("have.value", text);
      } else {
        cy.get(field).should("have.text", text);
      }
    });
  }
});

Cypress.Commands.add("switchLanguage", (language) => {
  cy.contains("a", language === "en" ? "English" : "Français")
    .should("be.visible")
    .click();
  cy.location("pathname").should("contain", `/${language}/`);
  cy.contains("a", language === "en" ? "Français" : "English").should("be.visible");
});

// Request a page over http from the server and mount it in the DOM
//
// To simulate server side rendering remove all scripts so no window:onload
// events can occur and we can test server rendered views
Cypress.Commands.add("serverSideRendered", (path) => {
  cy.reload();
  cy.request(path)
    .its("body")
    .then((html) => {
      html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      cy.document().then((doc) => doc.write(html));
    });
  cy.get("script").should("not.exist");
});
