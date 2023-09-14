describe("CDS Intake Form functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/cdsIntakeTestForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => {
    cy.useFlag("formTimer", false);
    cy.visitForm(formID);
  });
  it("CDS Intake Form renders", () => {
    cy.get("h1").contains("CDS Intake Form");
  });

  it("Fill out and Submit the form", () => {
    cy.typeInField("input[id='1']", "Santa");
    cy.typeInField("input[id='2']", "santa@northpole.global");
    cy.typeInField("input[id='3']", "Self-Employed");
    cy.typeInField("input[id='4']", "Global Delivery");
    cy.typeInField("textarea[id='5']", "How can I better stream line letters from children.");
    cy.typeInField("input[id='6']", "December 25, 2021");
    cy.typeInField(
      "textarea[id='7']",
      "Canadian Digital Service has been in the news so much lately because of the COVID Alert App."
    );

    cy.get("[type='submit']").click();
    cy.url().should("include", "/confirmation");
    cy.get("h1").should("have.focus");
  });
});
