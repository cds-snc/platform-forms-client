describe("Forms Functionality", () => {
  describe("text field tests", () => {
    beforeEach(() => {
      cy.useFlag("formTimer", false);
      cy.mockForm("../../tests/data/textFieldTestForm.json");
    });
    it("the form displays an error when it is submitted and a field is required", () => {
      cy.get("[type='submit']").click();
      cy.get("h2.gc-h3").contains("Please correct the errors on the page");
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
    beforeEach(() => {
      cy.useFlag("formTimer", true);
      cy.mockForm("../../tests/data/textFieldTestForm.json");
    });
    it("should display alert message when submitting too quickly", () => {
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      cy.get("[role='alert']").should("be.visible");
      cy.get("[role='alert']").contains("Button can not be used");
    });
    it("should display the 'button ready' alert after waiting for delay", () => {
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(6000);
      cy.get("[role='alert']").contains("The button's ready.");
    });
    it("should submit the button after the proper delay", () => {
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      cy.get("[type='submit']").click();
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(6000);
      cy.get("[type='submit']").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });
});

describe("Forms Functionality - Character Counts", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.mockForm("../../tests/data/textFieldTestForm.json");
  });

  it("does not display any message when not enough characters have been typed in", () => {
    cy.get("input[id='2']").type("This is 21 characters");
    cy.get("div[id='characterCountMessage2']").should("not.exist");
  });

  it("displays a message with the number of characters remaining", () => {
    cy.get("input[id='2']").type("This is 35 characters This is 35 ch");
    cy.get("div[id='characterCountMessage2']").contains("You have 5 characters left.");
  });

  it("displays an error message indicating too many characters", () => {
    cy.get("input[id='2']").type("This is 48 characters This is 48 characters This");
    cy.get("div[id='characterCountMessage2']").contains("You have 8 characters too many.");
  });

  it("won't submit the form if the number of characters is too many", () => {
    cy.get("input[id='2']").type("This is too many characters. This is too many characters.");
    cy.get("[type='submit']").click();
    cy.get("h2.gc-h3").contains("Please correct the errors on the page");
  });
});
