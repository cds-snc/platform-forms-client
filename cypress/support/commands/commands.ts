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

Cypress.Commands.add("userSession", (options?: { admin?: boolean; acceptableUse?: boolean }) => {
  const { admin = false, acceptableUse = true } = options || {};

  cy.session(
    [`${admin ? "admin" : "user"}`, `${acceptableUse ? "AcceptableUse" : "NoAcceptableUse"}`],
    () => {
      cy.visitPage("/en/auth/login");
      cy.get("input[id='username']").should("be.visible");
      cy.get("input[id='password']").should("be.visible");
      if (admin) {
        cy.typeInField("input[id='username']", "test.admin@cds-snc.ca");
      } else {
        cy.typeInField("input[id='username']", "test.user@cds-snc.ca");
      }
      cy.typeInField("input[id='password']", "testTesttest");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='verificationCodeForm']").should("be.visible");

      cy.typeInField("input[id='verificationCode']", "12345");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.url().should("contain", "/en/auth/policy");

      // Ensure cookie is created
      cy.waitUntil(
        () =>
          cy.getCookie("authjs.session-token").then((cookie) => Boolean(cookie && cookie.value)),
        { timeout: 10000, interval: 500 }
      );

      if (acceptableUse) {
        cy.visitPage("/en/auth/policy");
        cy.get("#acceptableUse").click();
        cy.location("pathname").should("eq", "/en/forms");
        cy.get("#react-hydration-loader").should("not.exist");
        cy.get("main").should("be.visible");
      }
    },
    {
      validate() {
        cy.getCookie("authjs.session-token").should("exist");
      },
      cacheAcrossSpecs: true,
    }
  );
});

Cypress.Commands.add("useForm", (file, published = true) => {
  // If a session already exists use the existing session
  cy.getCookie("authjs.session-token")
    .then((cookie) => {
      if (cookie) {
        return true;
      }
      return false;
    })
    .then((sessionExists) => {
      if (!sessionExists) {
        cy.userSession({ acceptableUse: true });
      }
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
      if (!sessionExists) {
        cy.logout();
      }
    });
});

/**
 * Navigate to the fixture created in useForm
 */
Cypress.Commands.add("visitForm", (formID, language = "en") => {
  cy.visitPage(`/${language}/id/${formID}`);
  cy.get("#form-submit-button").should("exist");
});

/**
 * Navigate to a page and wait for it to load
 */
Cypress.Commands.add("visitPage", (path) => {
  cy.waitForNetworkIdlePrepare({
    method: "GET",
    pattern: "/api/auth/*",
    alias: "calls",
  });
  cy.visit(path);
  // Ensure page has fully loaded
  cy.get("#react-hydration-loader").should("not.exist");
  cy.get("main").should("be.visible");
  //  Ensure network calls have ended that drive renders
  cy.waitForNetworkIdle("@calls", 1000);
});

/**
 * Log the test user into the application
 */

Cypress.Commands.add("login", (options?: { admin?: boolean; acceptableUse?: boolean }) => {
  const { admin = false, acceptableUse = true } = options || {};
  cy.request({
    method: "GET",
    url: "/api/auth/csrf",
  }).then((response) => {
    expect(response.body).to.have.property("csrfToken");

    cy.visitPage("/en/auth/login");
    cy.get("input[id='username']").should("be.visible");
    cy.get("input[id='password']").should("be.visible");
    if (admin) {
      cy.typeInField("input[id='username']", "test.admin@cds-snc.ca");
    } else {
      cy.typeInField("input[id='username']", "test.user@cds-snc.ca");
    }
    cy.typeInField("input[id='password']", "testTesttest");
    cy.get("button[type='submit']").should("be.visible");
    cy.get("button[type='submit']").click();
    cy.get("[id='verificationCodeForm']").should("be.visible");

    cy.typeInField("input[id='verificationCode']", "12345");
    cy.get("button[type='submit']").should("be.visible");
    cy.get("button[type='submit']").click();
    cy.url().should("contain", "/en/auth/policy");

    // Ensure cookie is created
    cy.waitUntil(
      () => cy.getCookie("authjs.session-token").then((cookie) => Boolean(cookie && cookie.value)),
      { timeout: 10000, interval: 500 }
    );

    //let session;
    if (acceptableUse) {
      cy.visitPage("/en/auth/policy");
      cy.get("#acceptableUse").click();
      cy.location("pathname").should("eq", "/en/forms");
      cy.get("#react-hydration-loader").should("not.exist");
      cy.get("main").should("be.visible");
    }
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
  // Ensure JWT Token in cookie is removed
  cy.clearCookie("authjs.session-token");
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
      if (($el[0] as HTMLInputElement).value !== undefined) {
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
