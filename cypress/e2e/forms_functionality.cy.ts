describe("Forms Functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/textFieldTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  describe("text field tests", () => {
    beforeEach(() => {
      cy.visitForm(formID);
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
});
