describe("TSB Contact Form functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/tsbContactTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.visitForm(formID);
  });

  it("TSB Contact Form renders", () => {
    cy.get("h1").contains("Transportation Safety Board of Canada general enquiries");
  });
  it("Fill out and Submit the form", () => {
    cy.get("input[id='2']").type("Santa");
    cy.get("input[id='2']").should("have.value", "Santa");
    cy.get("input[id='3']").type("santa@northpole.global");
    cy.get("input[id='3']").should("have.value", "santa@northpole.global");
    cy.get(".gc-checkbox-label").click({ multiple: true });
    cy.get("input[id='5']").type("Specifying what 'other' means");
    cy.get("input[id='5']").should("have.value", "Specifying what 'other' means");
    cy.get("textarea[id='6']").type(
      "Contacting the Transportation Safety Board for a personal inquiry"
    );
    cy.get("textarea[id='6']").should(
      "have.value",
      "Contacting the Transportation Safety Board for a personal inquiry"
    );

    cy.get("[type='submit']").click();
    cy.url().should("include", `/confirmation`);
    cy.get("h1").contains("Thank you for your message");
    cy.get("[data-testid='fip']").find("img").should("have.attr", "src", "/img/tsb-en.png");
    cy.get("#content").contains(
      "The Transportation Safety Board of Canada will respond to you within a week."
    );
  });
});
