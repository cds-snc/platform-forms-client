describe("Security Questions Page", () => {
  // NOTE: looking at text values instead of Id's since each run would return different
  // generated question Id's
  const questions1 = "What was your favourite school subject?";
  const questions2 = "What was the name of your first manager?";
  const questions3 = "What was the make of your first car?";

  beforeEach(() => {
    cy.visitPage("/en/auth/login");
    cy.typeInField("input[id='username']", "test.withoutSecurityAnswers@cds-snc.ca");
    cy.typeInField("input[id='password']", "testTesttest");
    cy.get("button[type='submit']").click();
    cy.get("input[id='verificationCode']").should("be.visible");
    cy.get("input[id='verificationCode']").click();
    cy.typeInField("input[id='verificationCode']", "12345");
    cy.get("button[type='submit']").should("be.visible");
    cy.get("button[type='submit']").click();
  });
  afterEach(() => {
    cy.resetAll();
  });

  it("En page renders", () => {
    cy.get("h1").should("contain", "Set up security questions");
  });

  describe("Test form validation", () => {
    it("Fails to submit on an empty form", () => {
      cy.get("#question1").select(questions1);
      cy.get("#question1").find(":selected").contains(questions1);
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage'").should(
        "contain",
        "Complete the required field to continue."
      );
    });

    it("Fails to submit when a question is not selected", () => {
      cy.get("#question1").select(questions1);
      cy.get("#question1").find(":selected").contains(questions1);
      cy.typeInField("#answer1", "1234");
      cy.get("#question2").select(questions2);
      cy.get("#question2").find(":selected").contains(questions2);
      cy.typeInField("#answer2", "12345");
      cy.typeInField("#answer3", "123456");
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage'").should(
        "contain",
        "Complete the required field to continue."
      );
    });

    it("Fails to submit when a answer is not filled in", () => {
      cy.get("#question1").select(questions1);
      cy.get("#question1").find(":selected").contains(questions1);
      cy.typeInField("#answer1", "1234");
      cy.get("#question2").select(questions2);
      cy.get("#question2").find(":selected").contains(questions2);
      cy.typeInField("#answer2", "12345");
      cy.get("#question3").select(questions3);
      cy.get("#question3").find(":selected").contains(questions3);
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage'").should(
        "contain",
        "Complete the required field to continue."
      );
    });

    it("Fails to submit when a question is too short", () => {
      cy.get("#question1").select(questions1);
      cy.get("#question1").find(":selected").contains(questions1);
      cy.typeInField("#answer1", "1234");
      cy.get("#question2").select(questions2);
      cy.get("#question2").find(":selected").contains(questions2);
      cy.typeInField("#answer2", "12345");
      cy.get("#question3").select(questions3);
      cy.get("#question3").find(":selected").contains(questions3);
      cy.typeInField("#answer3", "1");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageanswer3").should("contain", "Must be at least 4 characters");
    });

    it("Fails to submit when there is a duplicate answer", () => {
      cy.get("#question1").select(questions1);
      cy.typeInField("#answer1", "1234");
      cy.get("#question2").select(questions2);
      cy.typeInField("#answer2", "1234");
      cy.get("#question3").select(questions3);
      cy.typeInField("#answer3", "abcd");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageanswer1").should(
        "contain",
        "Answers cannot be the same. Create a unique answer for this question"
      );
    });
  });

  describe("Test questions select behavior", () => {
    it("Select a question should update the selected 'value'", () => {
      cy.get("#question1").select(questions1);
      cy.get("#question1 option:selected").should("have.text", questions1);
      cy.get("#question2").select(questions2);
      cy.get("#question2 option:selected").should("have.text", questions2);
      cy.get("#question3").select(questions3);
      cy.get("#question3 option:selected").should("have.text", questions3);
    });
  });

  describe("Filling in the form correctly should successfully submit", () => {
    it("Select a question should update the selected 'value'", () => {
      cy.get("#question1").select(questions1);
      cy.get("#question1").find(":selected").contains(questions1);
      cy.typeInField("#answer1", "1234");
      cy.get("#question2").select(questions2);
      cy.get("#question2").find(":selected").contains(questions2);
      cy.typeInField("#answer2", "12345");
      cy.get("#question3").select(questions3);
      cy.get("#question3").find(":selected").contains(questions3);
      cy.typeInField("#answer3", "123456");
      cy.get("button[type='submit']").click();
      cy.get("#acceptableUse").click();
      cy.url().should("contain", "/en/myforms");
    });
  });
});
