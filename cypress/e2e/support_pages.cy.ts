describe("Support Pages", () => {
  describe("Support Page", () => {
    beforeEach(() => {
      cy.visitPage("/en/form-builder/support/");
    });

    it("English page loads", () => {
      cy.get("h1").should("contain", "Get support");
    });

    it("French page loads", () => {
      cy.get("a[lang='fr']").click();
      cy.url().should("contain", "/fr");
      cy.get("h1").should("contain", "Soutien");
    });

    it("Required fields stops submission", () => {
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage']").should("be.visible");
    });

    it("Invalid email stops submission", () => {
      cy.typeInField("#email", "bad@email");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageemail").should("be.visible");
    });

    it("Valid submission succeeds", () => {
      cy.typeInField("#name", "1");
      cy.typeInField("#email", "good@email.com");
      cy.get("label[for='request-question']").click();
      cy.typeInField("#description", "1");
      cy.get("button[type='submit']").click();
      cy.get("h1").contains("Thank you for your request");
    });
  });

  describe("Contact Us Page", () => {
    beforeEach(() => {
      cy.visitPage("/en/form-builder/support/contactus");
    });

    it("English page loads", () => {
      cy.get("h1").should("contain", "Contact us");
    });

    it("French page loads", () => {
      cy.get("a[lang='fr']").click();
      cy.url().should("contain", "/fr");
      cy.get("h1").should("contain", "Contactez-nous");
    });

    it("Required fields stops submission", () => {
      cy.get("button[type='submit']").click();
      cy.get("p[data-testid='errorMessage']").should("be.visible");
    });

    it("Invalid email stops submission", () => {
      cy.typeInField("#email", "bad@email");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageemail").should("be.visible");
    });

    it("Valid submission succeeds", () => {
      cy.typeInField("#name", "1");
      cy.typeInField("#email", "good@email.com");
      cy.typeInField("#department", "1");
      cy.typeInField("#branch", "1");
      cy.typeInField("#jobTitle", "1");
      cy.get("label[for='request-question']").click();
      cy.typeInField("#description", "1");
      cy.get("button[type='submit']").click();
      cy.get("h1").contains("Thank you for your request");
    });
  });
});
