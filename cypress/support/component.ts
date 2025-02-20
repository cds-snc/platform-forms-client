// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from "cypress/react";
import "../../styles/app.scss";

// Add cy.tab() command
require("cypress-plugin-tab");

Cypress.Commands.add("mount", mount);
