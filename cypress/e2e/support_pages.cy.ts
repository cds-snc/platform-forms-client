describe("Support Pages", () => {
  describe("Support Page", () => {
    beforeEach(() => {
      cy.useFlag("supportForms", true);
      cy.visit("/en/form-builder/support/");
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
      cy.get("#email").type("bad@email");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageemail").should("be.visible");
    });

    it("Valid submission succeeds", () => {
      cy.get("#name").type("1");
      cy.get("#email").type("good@email.com");
      cy.get("label[for='request-question']").click();
      cy.get("#description").type("1");
      cy.get("button[type='submit']").click();
      cy.get("h1").contains("Thank you for your request");
    });
  });

  describe("Contact Us Page", () => {
    beforeEach(() => {
      cy.useFlag("supportForms", true);
      cy.visit("/en/form-builder/support/contactus");
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
      cy.get("#email").type("bad@email");
      cy.get("button[type='submit']").click();
      cy.get("#errorMessageemail").should("be.visible");
    });

    it("Valid submission succeeds", () => {
      cy.get("#name").type("1");
      cy.get("#email").type("good@email.com");
      cy.get("#department").type("1");
      cy.get("#branch").type("1");
      cy.get("#jobTitle").type("1");
      cy.get("label[for='request-question']").click();
      cy.get("#description").type("1");
      cy.get("button[type='submit']").click();
      cy.get("h1").contains("Thank you for your request");
    });
  });
});
