import { NextData } from "types";

describe("Test FormBuilder language switching", () => {
  beforeEach(() => {
    cy.visit("/form-builder", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
        let nextData: NextData;
        Object.defineProperty(win, "__NEXT_DATA__", {
          set(serverSideProps) {
            serverSideProps.context = {
              user: {
                acceptableUse: true,
                name: null,
                userId: "testId",
              },
            };
            nextData = serverSideProps;
          },
          get() {
            return nextData;
          },
        });
      },
    });
  });

  it("Can enter English and French text in Introduction", () => {
    // Setup a form with one question
    cy.get("h2").first().click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="richText"]').click();
    cy.get("button").contains("Select block").click();

    // Enter English Title and Introduction
    cy.get("#formTitle").type("Cypress Test Form");
    cy.get("#formTitle").should("have.value", "Cypress Test Form");
    cy.get(`[aria-label="Form introduction"]`).type("form intro in english");
    cy.get(`[aria-label="Form introduction"]`).contains("form intro in english");

    // Enter some English "page text"
    cy.get('[aria-label="Page text 1"]').type("page text in english");
    cy.get('[aria-label="Page text 1"]').contains("page text in english");

    // Enter English Privacy Statement
    cy.get('[aria-label="Privacy statement"]').type("privacy text in english");
    cy.get('[aria-label="Privacy statement"]').contains("privacy text in english");

    // Enter English Confirmation Page
    cy.get('[aria-label="Confirmation page and message"]').type("confirmation text in english");
    cy.get('[aria-label="Confirmation page and message"]').contains("confirmation text in english");

    // Switch to French
    cy.get('[data-testid="lang-switcher"]').click();

    // Enter French Title and Introduction
    cy.get("#formTitle").type("Formulaire de test Cypress");
    cy.get("#formTitle").should("have.value", "Formulaire de test Cypress");
    cy.get(`[aria-label="Form introduction"]`).type("form intro in french");
    cy.get(`[aria-label="Form introduction"]`).contains("form intro in french");

    // Enter some French "page text"
    cy.get('[aria-label="Page text 1"]').type("page text in french");
    cy.get('[aria-label="Page text 1"]').contains("page text in french");

    // Enter French Privacy Statement
    cy.get('[aria-label="Privacy statement"]').type("privacy text in french");
    cy.get('[aria-label="Privacy statement"]').contains("privacy text in french");

    // Enter French Confirmation Page
    cy.get('[aria-label="Confirmation page and message"]').type("confirmation text in french");
    cy.get('[aria-label="Confirmation page and message"]').contains("confirmation text in french");

    // Switch back to English
    cy.get('[data-testid="lang-switcher"]').click();
    cy.get("#formTitle").should("have.value", "Cypress Test Form");
    cy.get(`[aria-label="Form introduction"]`).contains("form intro in english");
    cy.get('[aria-label="Page text 1"]').contains("page text in english");
    cy.get('[aria-label="Privacy statement"]').contains("privacy text in english");
    cy.get('[aria-label="Confirmation page and message"]').contains("confirmation text in english");

    // Switch back to French
    cy.get('[data-testid="lang-switcher"]').click();
    cy.get("#formTitle").should("have.value", "Formulaire de test Cypress");
    cy.get(`[aria-label="Form introduction"]`).contains("form intro in french");
    cy.get('[aria-label="Page text 1"]').contains("page text in french");
    cy.get('[aria-label="Privacy statement"]').contains("privacy text in french");
    cy.get('[aria-label="Confirmation page and message"]').contains("confirmation text in french");
  });
});
