describe("Forms Functionality", () => {
  let formID;
  before(() => {
    cy.useForm("../../__fixtures__/textFieldTestForm.json");
    cy.get("@formID").then((createdID) => (formID = createdID));
  });
  describe("text field tests", () => {
    beforeEach(() => {
      cy.useFlag("formTimer", false);
      cy.visitForm(formID);
    });
    it("the form displays an error when it is submitted and a field is required", () => {
      cy.get("[type='submit']").click();
      cy.get("h2").contains("Please correct the errors on the page");
      cy.get("div.gc-alert__body a").contains("Complete the required field to continue.");
      cy.get("div.gc-alert__body a").click();
      cy.get("input[id='2']").should("have.focus");
      cy.get(".gc-error-message").contains("Complete the required field to continue.");
    });
    it("fills the text field successfully and submits the form", () => {
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });

  describe("Submit Delay", () => {
    beforeEach(() => {
      cy.useFlag("formTimer", true);
      cy.visitForm(formID);
    });
    it("should display alert message when submitting too quickly", () => {
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      cy.get("[role='alert']").should("be.visible");
      cy.get("[role='alert']").contains("Button cannot be used");
    });
    it("should display the 'button ready' alert after waiting for delay", () => {
      cy.clock();
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.tick(1000);
      cy.get("[type='submit']").click();
      cy.get("[role='alert']").should("be.visible");
      cy.get("[role='alert']").contains("Button cannot be used");
      cy.tick(6000);
      cy.get("[role='alert']").contains("The button is ready.");
    });
    it("should submit the button after the proper delay", () => {
      cy.clock();
      cy.tick(1000);
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.tick(6000);
      cy.get("[type='submit']").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });
});
