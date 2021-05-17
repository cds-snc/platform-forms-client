describe("TSB Contact Form functionality", { baseUrl: "http://localhost:3000" }, () => {
  let formMetaData = null;

  before(() => {
    //Get form JSON configuration
    cy.readFile("forms/TSB-contact.json").then((response) => {
      formMetaData = response;
    });
  });

  it("TSB Contact Form renders", () => {
    cy.visit(`/en/id/${formMetaData.form.id}`);
    cy.get("h1").contains(formMetaData.form.titleEn);
  });
  it("Fill out the form", () => {
    cy.get("input[id='2']").type("Santa").should("have.value", "Santa");
    cy.get("input[id='3']")
      .type("santa@northpole.global")
      .should("have.value", "santa@northpole.global");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.get("input[id='5']")
      .type("Specifying what 'other' means")
      .should("have.value", "Specifying what 'other' means");
    cy.get("textarea[id='6']")
      .type("Contacting the Transportion Safety Board for a personal inquiry")
      .should("have.value", "Contacting the Transportion Safety Board for a personal inquiry");
  });
  it("Submit the Form", () => {
    cy.get("button").contains("Submit").click();
    cy.url().should("include", `/en/id/${formMetaData.form.id}/confirmation`);
    cy.get("h1").contains("Thank you for your message");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/tsb-en.png");
    cy.get("#content").contains(
      "The Transportation Safety Board of Canada will respond to you within a week. \n\r <a href='https://www.tsb.gc.ca/eng/index.html'>Go back.</a>"
    );
  });
});
