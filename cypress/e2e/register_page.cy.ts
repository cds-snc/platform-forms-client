describe("Register Page", () => {
  beforeEach(() => {
    cy.visitPage("/en/signup/register");
  });

  // TODO test French translation when signup form more final

  it("En page renders", () => {
    cy.get("h1").should("contain", "Create an account");
  });

  describe("Name validation errors when submitting a form.", () => {
    it("Error on submitting a form with an empty name field", () => {
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagename']").should(
        "contain",
        "Complete the required field to continue."
      );
    });
    it("No error on submitting a form with a name", () => {
      cy.typeInField("input[id='name']", "My Name");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagename']").should("not.exist");
    });
  });

  describe("Username validation errors when submitting a form.", () => {
    it("Error on submitting a form with an empty email field", () => {
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessageusername']").should(
        "contain",
        "Complete the required field to continue."
      );
    });
    it("Error on submitting a form with an invalid email", () => {
      cy.typeInField("input[id='username']", "myemail@email");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessageusername']").should("contain", "Enter a valid email address.");
    });
    it("Error on submitting a form with a non government email", () => {
      cy.typeInField("input[id='username']", "myemail@email.com");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessageusername']").should(
        "contain",
        "This field must be a valid federal government email"
      );
    });
    it("No error on submitting a form with a valid government email", () => {
      cy.typeInField("input[id='username']", "myemail@cds-snc.ca");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessageusername']").should("not.exist");
    });
  });

  describe("Password validation errors when submitting a form.", () => {
    it("Error on submitting a form with an empty password field", () => {
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should(
        "contain",
        "Complete the required field to continue."
      );
    });
    it("Error on submitting a form with a short password", () => {
      cy.typeInField("input[id='password']", "pass");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should("contain", "must be at least 8 characters");
    });
    it("Error on submitting a form with a long password", () => {
      cy.get("input[id='password']").type(
        "passpasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspasspass"
      );
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should("contain", "must not exceed 50 characters");
    });
    it("Error on submitting a form with no lowercase", () => {
      cy.typeInField("input[id='password']", "PASSWORD");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should(
        "contain",
        "must contain at least 1 lowercase character"
      );
    });
    it("Error on submitting a form with no uppercase", () => {
      cy.typeInField("input[id='password']", "password");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should(
        "contain",
        "must contain at least 1 uppercase character"
      );
    });
    it("Error on submitting a form with no number", () => {
      cy.typeInField("input[id='password']", "Password");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should(
        "contain",
        "Password must contain at least 1 number"
      );
    });
    it("Error on submitting a form with no symbol", () => {
      cy.typeInField("input[id='password']", "Password1");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should("contain", "must contain at least 1 symbol.");
    });
    it("No error on submitting a form with a valid password", () => {
      cy.typeInField("input[id='password']", "Password1!");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepassword']").should("not.exist");
    });
  });

  describe("Password confirmation validation errors when submitting a form.", () => {
    it("Error on submitting a form with an empty password confirmation field", () => {
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepasswordConfirmation']").should(
        "contain",
        "Complete the required field to continue."
      );
    });
    it("Error on submitting a form with a non matching password confirmation field", () => {
      cy.typeInField("input[id='password']", "Password1!");
      cy.typeInField("input[id='passwordConfirmation']", "Password1!!!!!!!");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepasswordConfirmation']").should(
        "contain",
        "The entries for password must match."
      );
    });
    it("No error on submitting a form with a matching password confirmation field", () => {
      cy.typeInField("input[id='password']", "Password1!");
      cy.typeInField("input[id='passwordConfirmation']", "Password1!");
      cy.get("[type='submit']").click();
      cy.get("[id='errorMessagepasswordConfirmation']").should("not.exist");
    });
  });
});
