const A11Y_OPTIONS = {
  runOnly: {
    type: "tag",
    values: ["wcag21aa", "wcag2aa", "best-practice", "section508"],
  },
};

describe.skip("Forms Functionality", () => {
  describe("text field tests", () => {
    it("renders the form", () => {
      cy.visit("/en/id/1?mockedFormFile=textFieldTestForm");
      cy.get("h1").contains("Text Field Test Form");
    });
    it("the form with the text fields is fully accessible", () => {
      cy.injectAxe();
      cy.checkA11y(null, A11Y_OPTIONS);
    });
    it("the form displays an error when it is submitted and the text field is required", () => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000);
      cy.get("[type='submit']").click();
      cy.checkA11y(null, A11Y_OPTIONS);
      cy.get("h2.gc-h3").contains("Please correct the errors on the page");
      cy.get("div.gc-alert__body a").contains("Please complete the required field to continue");
      cy.get("div.gc-alert__body a").click();
      cy.get("input[id='2']").should("have.focus");
      cy.get(".gc-error-message").contains("Please complete the required field to continue");
    });
    it("fills the text field successfully and submits the form", () => {
      cy.reload();
      cy.get("input[id='2']").type("Test Value").should("have.value", "Test Value");
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(5000);
      cy.get("[type='submit']").click();
      cy.get("#submitted-thank-you").contains("Submitted thank you!");
    });
  });
});

describe.skip("Forms Functionality - Submit Delay", () => {
  beforeEach(() => {
    cy.intercept(
      { method: "GET", url: "/api/flags/formTimer/check" },
      {
        statusCode: 200,
        body: {
          status: true,
        },
      }
    );
  });
  it("should display alert message when submitting too quickly", () => {
    cy.visit("/en/id/1?mockedFormFile=textFieldTestForm");
    cy.get("[type='submit']").click();
    cy.get("[role='alert']").should("be.visible");
    cy.get("[role='alert']").contains("Button can not be used");
  });
  it("should display the 'button ready' alert after waiting for delay", () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.get("[role='alert']").contains("The button's ready.");
  });
  it("should attempt to submit the button after in the 'button ready' state", () => {
    cy.get("[type='submit']").click();
  });
});

describe("Forms Functionality - Character Counts", () => {
  beforeEach(() => {
    cy.visit("/en/id/1?mockedFormFile=textFieldTestForm");
  });

  it("does not display any message when not enough characters have been typed in", () => {
    cy.get("input[id='2']").type("This is 21 characters");
    cy.get("div[id='character-count-message']").should("not.exist");
  });

  it("displays a message with the number of characters remaining", () => {
    cy.get("input[id='2']").type("This is 35 characters This is 35 ch");
    cy.get("div[id='character-count-message']").contains("You have 5 characters left.");
  });

  it("displays an error message indicating too many characters", () => {
    cy.get("input[id='2']").type("This is 48 characters This is 48 characters This");
    cy.get("div[id='character-count-message']").contains("You have 8 characters too many.");
  });

  it("won't submit the form if the number of characters is too many", () => {
    cy.get("input[id='2']").type("This is too many characters. This is too many characters.");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.get("[type='submit']").click();
    cy.get("h2.gc-h3").contains("Please correct the errors on the page");
  });
});
