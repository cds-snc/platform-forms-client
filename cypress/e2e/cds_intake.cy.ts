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
    cy.get("input[id='1']").type("Santa");
    cy.get("input[id='1']").should("have.value", "Santa");
    cy.get("input[id='2']").type("santa@northpole.global");
    cy.get("input[id='2']").should("have.value", "santa@northpole.global");
    cy.get("input[id='3']").type("Self-Employed");
    cy.get("input[id='3']").should("have.value", "Self-Employed");
    cy.get("input[id='4']").type("Global Delivery");
    cy.get("input[id='4']").should("have.value", "Global Delivery");
    cy.get("textarea[id='5']").type("How can I better stream line letters from children.");
    cy.get("textarea[id='5']").should(
      "have.value",
      "How can I better stream line letters from children."
    );
    cy.get("input[id='6']").type("December 25, 2021");
    cy.get("input[id='6']").should("have.value", "December 25, 2021");
    cy.get("textarea[id='7']").type(
      "Canadian Digital Service has been in the news so much lately because of the COVID Alert App."
    );
    cy.get("textarea[id='7']").should(
      "have.value",
      "Canadian Digital Service has been in the news so much lately because of the COVID Alert App."
    );

    cy.get("[type='submit']").click();
    cy.url().should("include", "/confirmation");
    cy.get("h1").should("have.focus");
  });
});
