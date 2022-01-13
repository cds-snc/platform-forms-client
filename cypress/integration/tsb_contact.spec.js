describe("TSB Contact Form functionality", () => {
  let formConfig = null,
    formID = null;

  before(() => {
    // Find the JSON configuration
    const body = {
      method: "GET",
    };
    cy.request("/api/templates", JSON.stringify(body)).then((response) => {
      const record = response.body.data.records.find(
        (rec) => rec.formConfig.internalTitleEn === "Contact Us - TSB"
      );
      formConfig = record.formConfig;
      formID = record.formID;
    });
  });

  it("TSB Contact Form renders", () => {
    cy.visit(`/en/id/${formID}`);
    cy.get("h1").contains(formConfig.form.titleEn);
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
    cy.url().should("include", `/en/id/${formID}/confirmation`);
    cy.get("h1").contains("Thank you for your message");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/tsb-en.png");
    cy.get("#content").contains(
      "The Transportation Safety Board of Canada will respond to you within a week."
    );
  });
});
