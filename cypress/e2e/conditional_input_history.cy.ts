describe("Conditional Input History functionality", () => {
  let formID: string;
  before(() => {
    cy.useForm("../../__fixtures__/conditionalInputHistoryForm.json");
    cy.get<string>("@formID").then((createdID) => (formID = createdID));
  });
  beforeEach(() => {
    cy.userSession({ admin: true });
    cy.visitForm(formID);
  });

  it("Renders properly", () => {
    cy.get("h1").contains("show-hide-groups-test");
  });
});
