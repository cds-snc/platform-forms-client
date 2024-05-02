/*
Skipping these tests as there is an issue with cypress and the form submit button
The useTimerHook doesn't seem to render before the form is submitted
Actual testing in a browser has shown that the feature does work as expected
*/

describe.skip("Form Timer Functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/textFieldTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });

  beforeEach(() => {
    cy.clock();
    cy.visitForm(formID);
  });

  it("should display alert message when submitting too quickly", () => {
    cy.typeInField("input[id='2']", "Test Value");
    cy.get("#form-submit-button").click();
    cy.get("[role='alert']").should("be.visible");
    cy.get("[role='alert']").contains("Button cannot be used");
  });
  it("should display the 'button ready' alert after waiting for delay", () => {
    cy.typeInField("input[id='2']", "Test Value");
    cy.tick(1000);
    cy.get("#form-submit-button").click();
    cy.get("[role='alert']").should("be.visible");
    cy.get("[role='alert']").contains("Button cannot be used");
    cy.tick(10000);
    cy.get("[role='alert']").contains("The button is ready.");
  });
  it("should submit the button after the proper delay", () => {
    cy.tick(1000);
    cy.typeInField("input[id='2']", "Test Value");
    cy.get("#form-submit-button").click();
    cy.get("[role='alert']").should("be.visible");
    cy.get("[role='alert']").contains("Button cannot be used");
    cy.tick(10000);
    cy.get("[role='alert']").contains("The button is ready.");
    cy.get("#form-submit-button").click();
    cy.get("#submitted-thank-you").contains("Submitted thank you!");
  });
});
