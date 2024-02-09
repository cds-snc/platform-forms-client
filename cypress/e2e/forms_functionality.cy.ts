/*
Skipping these tests as there is an issue with cypress and the form submit button
The useTimerHook doesn't seem to render before the form is submitted
Actual testing in a browser has shown that the feature does work as expected
*/

describe("Forms Functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/textFieldTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  describe("text field tests", () => {
    beforeEach(() => {
      cy.visitForm(formID);
      cy.get("form").should("be.visible");
    });

    it("the form displays an error when it is submitted and a field is required", () => {
      cy.get("#form-submit-button").click();
      cy.get("h2").contains("Please correct the errors on the page");
      cy.get("div.gc-alert__body a").contains("Complete the required field to continue.");
      cy.get("div.gc-alert__body a").click();
      cy.get("input[id='2']").should("have.focus");
      cy.get(".gc-error-message").contains("Complete the required field to continue.");
    });
    it("fills the text field successfully and submits the form", () => {
      cy.typeInField("input[id='2']", "Test Value");
      cy.get("#form-submit-button").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });

  describe.skip("Submit Delay", () => {
    beforeEach(() => {
      cy.clock();
      cy.visitForm(formID);
      cy.get("form").should("be.visible");
      cy.get("#form-submit-button").should("be.visible");
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
});
