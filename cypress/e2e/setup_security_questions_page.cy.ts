describe("Security Questions Page", () => {
  // NOTE: looking at text values instead of Id's since each run would return different
  // generated question Id's
  const questions1 = "What was your favourite school subject?";
  const questions2 = "What was the name of your first manager?";
  const questions3 = "What was the make of your first car?";

  beforeEach(() => {
    cy.visitPage("/en/auth/login");
    cy.get("input[id='username']").type("test.withoutSecurityAnswers@cds-snc.ca");
    cy.get("input[id='password']").type("testTesttest");
    cy.get("button[type='submit']").click();
    cy.get("input[id='verificationCode']").should("be.visible");
    cy.get("input[id='verificationCode']").type("12345");
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
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage'").should("contain", "Required field");
    });

    it("Fails to submit when a question is not selected", () => {
      cy.get("#question1").select(questions1);
      cy.get("#answer1").type("1234");
      cy.get("#question2").select(questions2);
      cy.get("#answer2").type("12345");
      cy.get("#answer3").type("123456");
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage'").should("contain", "Required field");
    });

    it("Fails to submit when a answer is not filled in", () => {
      cy.get("#question1").select(questions1);
      cy.get("#answer1").type("1234");
      cy.get("#question2").select(questions2);
      cy.get("#answer2").type("12345");
      cy.get("#question3").select(questions3);
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage'").should("contain", "Required field");
    });

    it("Fails to submit when a question is too short", () => {
      cy.get("#question1").select(questions1);
      cy.get("#answer1").type("1234");
      cy.get("#question2").select(questions2);
      cy.get("#answer2").type("12345");
      cy.get("#question3").select(questions3);
      cy.get("#answer3").type("1");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageanswer3").should("contain", "Must be at least 4 characters");
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
      cy.get("#answer1").type("1234");
      cy.get("#question2").select(questions2);
      cy.get("#answer2").type("12345");
      cy.get("#question3").select(questions3);
      cy.get("#answer3").type("123456");
      cy.get("button[type='submit']").click();
      cy.get("#acceptableUse").click();
      cy.url().should("contain", "/en/myforms");
    });
  });

});
