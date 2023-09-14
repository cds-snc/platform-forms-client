describe("Login Page", () => {
  describe("User login screen", () => {
    beforeEach(() => {
      cy.visitPage("/en/auth/login");
    });

    it("EN page renders", () => {
      cy.get("h1").should("contain", "Sign in");
      cy.get("input[id='username']").should("be.visible");
      cy.get("input[id='password']").should("be.visible");
    });

    it("Change page language", () => {
      cy.get("a[lang='fr']").click();
      cy.url().should("contain", "/fr");
      cy.get("h1").should("contain", "Se connecter");
    });

    it("Displays an error message when submitting an empty form.", () => {
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[data-testid='alert']").should("be.visible");
    });

    it("Displays an error message when submitting an empty username.", () => {
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='errorMessageusername']").should(
        "contain",
        "Complete the required field to continue."
      );
    });
    it("Displays an error message when submitting an invalid email", () => {
      cy.typeInField("input[id='username']", "myemail@cds-snc");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='errorMessageusername']").should("be.visible");
      cy.get("[id='errorMessageusername']").should("contain", "Enter a valid email address.");
    });
    it("Displays no error message when submitting a valid email", () => {
      cy.typeInField("input[id='username']", "test@cds-snc.ca");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='errorMessageusername']").should("not.exist");
    });

    it("Displays an error message when submitting an empty password.", () => {
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='errorMessageusername']").should("be.visible");
      cy.get("[id='errorMessagepassword']").should(
        "contain",
        "Complete the required field to continue."
      );
    });

    it("Displays an error message when submitting a password greater than 50 characters", () => {
      cy.typeInField("input[id='password']", "AAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaH");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should(
        "contain",
        "Password cannot exceed 50 characters."
      );
    });

    it("Displays no error message when submitting a valid password", () => {
      cy.typeInField("input[id='password']", "AAAaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should("not.exist");
    });
  });
  describe("User 2FA screen", () => {
    beforeEach(() => {
      cy.visitPage("/en/auth/login");
      cy.get("input[id='username']").should("be.visible");
      cy.get("input[id='password']").should("be.visible");
      cy.typeInField("input[id='username']", "test.user@cds-snc.ca");
      cy.typeInField("input[id='password']", "testTesttest");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[id='verificationCodeForm']").should("be.visible");
    });
    it("page renders", () => {
      cy.get("[id='verificationCodeForm']").should("be.visible");
      cy.get("input[id='verificationCode']").should("be.visible");
      cy.get("button[type='submit']").should("be.visible");
    });
    it("Displays an error message when submitting an empty form.", () => {
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[data-testid='errorMessage']").should("be.visible");
    });
    it("Displays an error message when submitting wrong number of characters.", () => {
      cy.get("input[id='verificationCode']").should("be.visible");
      cy.typeInField("input[id='verificationCode']", "12");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[data-testid='errorMessage']").should("be.visible");
    });
    it("Displays an error message when submitting a symbol in the verification code.", () => {
      cy.get("input[id='verificationCode']").should("be.visible");
      cy.typeInField("input[id='verificationCode']", "12/34");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.get("[data-testid='errorMessage']").should("be.visible");
    });
    it("Sucessfully submits a code", () => {
      cy.get("input[id='verificationCode']").should("be.visible");
      cy.typeInField("input[id='verificationCode']", "12345");
      cy.get("button[type='submit']").should("be.visible");
      cy.get("button[type='submit']").click();
      cy.url().should("contain", "/en/auth/policy");
    });
  });
});
