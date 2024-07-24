// Test is not keeping it's values when switching from french to english
describe("Test FormBuilder language switching", () => {
  it("Can enter English and French text in Description", () => {
    cy.visitPage("/en/form-builder/0000/edit");
    // Lang switcher only appears after page hydration
    cy.get('[data-testid="lang-switcher"]').should("be.visible");

    // Setup a form with one question

    cy.get("button").contains("Add").click();
    cy.get('[data-testid="richText"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    // Enter English Title and Description
    cy.typeInField("#formTitle", "Cypress Test Form");
    cy.get("#formTitle").should("have.value", "Cypress Test Form");
    cy.typeInField(`[aria-label="Form introduction"]`, "form description in english");

    // Enter some English "page text"
    cy.typeInField('[aria-label="Page text 1"]', "page text in english");

    // Enter English Privacy Statement
    cy.typeInField('[aria-label="Privacy statement"]', "privacy text in english");

    // Enter English Confirmation Page
    cy.typeInField('[aria-label="Confirmation message"]', "confirmation text in english");

    // Switch to French
    cy.get('[data-testid="lang-switcher"]').click();

    // Enter French Title and Description
    cy.typeInField("#formTitle", "Formulaire de test Cypress");
    cy.get("#formTitle").should("have.value", "Formulaire de test Cypress");
    cy.typeInField(`[aria-label="Form introduction"]`, "form description in french");

    // Enter some French "page text"
    cy.typeInField('[aria-label="Page text 1"]', "page text in french");

    // Enter French Privacy Statement
    cy.typeInField('[aria-label="Privacy statement"]', "privacy text in french");

    // Enter French Confirmation Page
    cy.typeInField('[aria-label="Confirmation message"]', "confirmation text in french");

    // Switch back to English
    cy.get('[data-testid="lang-switcher"]').click();

    cy.get("#formTitle").should("have.value", "Cypress Test Form");
    cy.get(`[aria-label="Form introduction"]`).contains("form description in english");
    cy.get('[aria-label="Page text 1"]').contains("page text in english");
    cy.get('[aria-label="Privacy statement"]').contains("privacy text in english");
    cy.get('[aria-label="Confirmation message"]').contains("confirmation text in english");

    // Switch back to French
    cy.get('[data-testid="lang-switcher"]').click();
    cy.get("#formTitle").should("have.value", "Formulaire de test Cypress");
    cy.get(`[aria-label="Form introduction"]`).contains("form description in french");
    cy.get('[aria-label="Page text 1"]').contains("page text in french");
    cy.get('[aria-label="Privacy statement"]').contains("privacy text in french");
    cy.get('[aria-label="Confirmation message"]').contains("confirmation text in french");
  });
});
