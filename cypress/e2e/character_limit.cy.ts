describe("Forms Functionality - Character Counts", () => {
  let formID: string;
  before(() => {
    cy.useFlag("formTimer", false);
    cy.useForm("../../__fixtures__/textFieldTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => cy.visitForm(formID));

  it("does not display any message when not enough characters have been typed in", () => {
    cy.typeInField("input[id='2']", "This is 21 characters");
    cy.get("div[id='characterCountMessage2']").should("not.exist");
  });

  it("displays a message with the number of characters remaining", () => {
    cy.typeInField("input[id='2']", "This is 35 characters This is 35 ch");
    cy.get("div[id='characterCountMessage2']").contains("You have 5 characters left.");
  });

  it("displays an error message indicating too many characters", () => {
    cy.typeInField("input[id='2']", "This is 48 characters This is 48 characters This");
    cy.get("div[id='characterCountMessage2']").contains("exceeded the limit");
  });

  it("won't submit the form if the number of characters is too many", () => {
    cy.typeInField("input[id='2']", "This is too many characters. This is too many characters.");
    cy.get("[type='submit']").click();
    cy.get("h2").contains("Please correct the errors on the page");
  });
});
