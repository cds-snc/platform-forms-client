describe("Test FormBuilder", () => {
  it("Renders form builder home page", () => {
    cy.visitPage("/en/form-builder");
    cy.get("h2").should("contain", "Design a form");
    cy.get("h2").should("contain", "Open a form file");
    cy.get("a[lang='fr']").click();
    cy.get("h2").should("contain", "Créer un formulaire");
    cy.get("h2").should("contain", "Ouvrir un formulaire");
  });

  it("Designs a form", () => {
    cy.viewport("macbook-15");
    cy.visitPage("/en/form-builder/0000/edit");
    cy.typeInField("#formTitle", "Cypress Test Form");

    cy.get('button[aria-label="Form set-up"]').click();

    // Form description
    cy.contains("summary", "Add a description to your form to help set expectations").click();
    cy.typeInField(`[aria-label="Form introduction"]`, "form description");

    // Privacy statement
    cy.contains(
      "summary",
      "Add a privacy statement to outline how you handle personal information"
    ).click();
    cy.typeInField(`[aria-label="Privacy statement"]`, "privacy statement");

    cy.get("button").contains("Add form element").click();

    cy.get('[data-testid="radio"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.typeInField("#item-1", "Question 1");
    cy.typeInField("#option--1--1", "option 1");
    cy.get("button").contains("Add option").click();
    cy.typeInField("#option--1--2", "option 2");

    // @todo re-visit this later
    // Confirmation message
    // cy.typeInField(`[aria-label="Confirmation message"]`, "confirmation page");

    // open modal
    cy.get("#item-1").click();
    cy.get("button").contains("More").click();
    cy.get("h2").should("contain", "More options");
    cy.get("#title--modal--1").should("have.value", "Question 1");
    cy.typeInField("#title--modal--1", "-1", "Question 1-1");
    cy.typeInField("#description--modal--1", "Question 1 description");
    cy.get("#required-1-id-modal").click({ force: true });
    cy.get('[data-testid="more-modal-save-button"]').click({ force: true });

    // re-check form editor
    cy.get("#item-1").scrollIntoView();
    cy.get("#item-1").should("have.value", "Question 1-1");
    cy.get("#item1-describedby").should("contain", "Question 1 description");
    cy.get("#required-1-id").should("be.checked");

    // preview form
    cy.get('[data-testid="preview"]').click();
    cy.get("#content h1").should("contain", "Cypress Test Form");
    cy.get(".gc-richText p").should("contain", "form description");
    cy.get("#label-1").should("contain", "Question 1-1");
    cy.get("#desc-1").should("contain", "Question 1 description");
    cy.get(".gc-input-radio").first().should("contain", "option 1");
    cy.get("#PreviewSubmitButton").should(
      "contain",
      "Sign in to test how you can submit and view responses"
    );

    // settings
    // cy.get('[data-testid="settings"]').click();
    // cy.get("h1").should("contain", "Settings");

    // publish form
    cy.get('[data-testid="publish"]').click();
    cy.get("h1").should("contain", "You can't publish yet");
    cy.get("a").contains("create one now").click();

    // can visit create account
    cy.url().should("contain", "/auth/register");
  });
});
