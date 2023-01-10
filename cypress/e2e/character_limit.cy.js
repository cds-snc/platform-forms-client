describe("Forms Functionality - Character Counts", () => {
  beforeEach(() => {
    cy.useFlag("formTimer", { isLoading: false, status: false });
    cy.mockForm("../../__fixtures__/textFieldTestForm.json");
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
    cy.get("h2").contains("Please correct the errors on the page");
  });
});
