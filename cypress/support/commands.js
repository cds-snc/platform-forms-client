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
    cy.visit("/en/id/test", {
      onBeforeLoad: (win) => {
        let nextData;

        Object.defineProperty(win, "__NEXT_DATA__", {
          set(serverSideProps) {
            // here is our change to modify the injected parsed data
            serverSideProps.props.pageProps.formConfig = mockedForm.form;
            nextData = serverSideProps;
          },
          get() {
            return nextData;
          },
        });
      },
    });
  });
});

Cypress.Commands.add("useFlag", (flagName, value) => {
  cy.intercept(
    { method: "GET", url: `/api/flags/${flagName}/check` },
    {
      statusCode: 200,
      body: {
        data: value,
      },
    }
  ).as(flagName);
});
