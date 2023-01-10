describe("Forms Functionality", () => {
  describe("text field tests", () => {
    beforeEach(() => {
      cy.useFlag("formTimer", false);
      cy.mockForm("../../__fixtures__/textFieldTestForm.json");
    });
    it("the form displays an error when it is submitted and a field is required", () => {
      cy.get("[type='submit']").click();
      cy.get("h2").contains("Please correct the errors on the page");
      cy.get("div.gc-alert__body a").contains("Please complete the required field to continue");
      cy.get("div.gc-alert__body a").click();
      cy.get("input[id='2']").should("have.focus");
      cy.get(".gc-error-message").contains("Please complete the required field to continue");
    });
    it("fills the text field successfully and submits the form", () => {
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });

  describe("Submit Delay", () => {
    it("should display alert message when submitting too quickly", () => {
      cy.useFlag("formTimer", { isLoading: false, status: true });
      cy.mockForm("../../__fixtures__/textFieldTestForm.json");
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      cy.get("[role='alert']").should("be.visible");
      cy.get("[role='alert']").contains("Button can not be used");
    });
    it("should display the 'button ready' alert after waiting for delay", () => {
      cy.clock();
      cy.useFlag("formTimer", { isLoading: false, status: true });
      cy.mockForm("../../__fixtures__/textFieldTestForm.json");
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.tick(1000);
      cy.get("[type='submit']").click();
      cy.get("[role='alert']").should("be.visible");
      cy.get("[role='alert']").contains("Button can not be used");
      cy.tick(6000);
      cy.get("[role='alert']").contains("The button's ready.");
    });
    it("should submit the button after the proper delay", () => {
      cy.clock();
      cy.useFlag("formTimer", { isLoading: false, status: true });
      cy.mockForm("../../__fixtures__/textFieldTestForm.json");
      cy.tick(1000);
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.tick(6000);
      cy.get("[type='submit']").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });
});
