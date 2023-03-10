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

Cypress.Commands.add("mockForm", (file) => {
  cy.fixture(file).then((mockedForm) => {
    cy.login();
    cy.request({
      method: "POST",
      url: "/api/templates",
      body: {
        formConfig: mockedForm,
      },
    }).then((response) => {
      expect(response.body).to.have.property("id");
      const formID = response.body.id;
      cy.logout().then(() => cy.visit(`/id/${formID}`));
    });
  });
});

Cypress.Commands.add("useFlag", (flagName, value) => {
  cy.request({
    method: "GET",
    url: `/api/flags/${flagName}/${value ? "enable" : "disable"}`,
  });
});

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
    }).then(() => cy.getCookie("next-auth.session-token").should("exist"));
  });
});

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
    }).then(() => cy.getCookie("next-auth.session-token").should("not.exist"));
  });
});
