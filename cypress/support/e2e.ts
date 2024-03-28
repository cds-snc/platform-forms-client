// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Axe-Core library
import "cypress-axe";
import terminalReport from "cypress-terminal-report/src/installLogsCollector";

import flagsDefault from "../../flag_initialization/default_flag_settings.json";

if (Cypress.env("DEBUG")) terminalReport();
// Reset the Database and Flags at a minimum between test suites
before(() => {
  cy.task("db:teardown");
  cy.task("db:seed");
  cy.login({ admin: true })
    .then(() => {
      Object.keys(flagsDefault).forEach((key) => {
        cy.useFlag(`${key}`, (flagsDefault as Record<string, boolean>)[key], true);
      });
    })
    .then(() => cy.logout());
});
