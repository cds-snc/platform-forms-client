describe("Forms Navigation Focus", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/navigationFocus.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });

  // Keep this isolated. Cypress seems to lose focus/* if there are previous or subsequent tests
  // that interact with the form.
  describe("Focus should remain on the error container when there are validation errors", () => {
    beforeEach(() => {
      cy.visitForm(formID);
    });

    it("Focus error validation correctly", () => {
      cy.get("label[for='1.0']").click();
      cy.get("button[data-testid='nextButton']").click();
      cy.get("button[data-testid='nextButton']").click(); // Trigger validation error
      cy.log("document.activeElement=", document.activeElement);
      cy.get("#gc-form-errors").should("have.focus");
    });
  });

  describe("Focus is on the correct heading when navigating or in an error state", () => {
    beforeEach(() => {
      cy.visitForm(formID);
    });

    it("H1 should not be focussed on the initial Start page load", () => {
      cy.get("h1").contains("Navigation Focus").should("not.have.focus");
    });

    it("Focus should be on H2 on navigating to a 'sub page'", () => {
      cy.get("label[for='1.0']").click();
      cy.get("button[data-testid='nextButton']").click();
      cy.get("form h2").should("have.focus");
    });

    it("Focusses H1 on navigating back to the Start page", () => {
      cy.get("label[for='1.0']").click();
      cy.get("button[data-testid='nextButton']").click();
      cy.get("button[data-testid='backButtonGroup']").click();
      cy.get("h1").contains("Navigation Focus").should("have.focus");
    });

    it("Focus should be on an H2 when jumping to a sub page from the Review page", () => {
      cy.get("label[for='1.0']").click(); // Select branch A
      cy.get("button[data-testid='nextButton']").click(); // Go to sub page A

      cy.typeInField("#2", "test"); // Avoid a validatione error
      cy.get("button[data-testid='nextButton']").click(); // Go to Review page

      cy.get("button[data-testid='editButton-bd4c615d-fef5-4a38-b1f0-c73954803867']")
        .first()
        .click(); // Go back to sub page A
      cy.get("form h2").should("have.focus");
    });

    it("Focus should be on an H1 when jumping back to the Start page from the Review page", () => {
      cy.get("label[for='1.0']").click(); // Select branch A
      cy.get("button[data-testid='nextButton']").click(); // Go to sub page A

      cy.typeInField("#2", "test"); // Avoid a validatione error
      cy.get("button[data-testid='nextButton']").click(); // Go to Review page

      cy.get("button[data-testid='editButton-start']").first().click(); // Go back to the Start page
      cy.get("h1").should("have.focus");
    });
  });
});
