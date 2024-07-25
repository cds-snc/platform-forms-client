// TODO: Look into using language keys -vs- strings. Easier to maintain that way.

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

  // it("Renders properly", () => {
  //   cy.get("h1").contains("show-hide-groups-test");
  // });

  it("Fill in data on branch A, B, C and verify Review page has correct data", () => {
    // Why CSS.escape? Ths is needed since the ID starts with a number. The browser will error
    // otherwise for a CSS selector that starts with a number unless escaped (despite the HTML spec)

    // Fill in data for Branch A
    cy.get(`[for='${CSS.escape("1.0")}']`).click(); // Select A
    cy.get("[data-testid='nextButton']").click();
    cy.get("h2").contains("P1");
    cy.get(`[for='${CSS.escape("2.0")}']`).click(); // Select P1-Q1, A
    cy.typeInField(`[for='${CSS.escape("3")}']`, "P1-Q1-A");
    cy.get(`[for='${CSS.escape("2.1")}']`).click(); // Select P1-Q1, B
    cy.typeInField(`[for='${CSS.escape("4")}']`, "P1-Q1-B");
    cy.get(`[for='${CSS.escape("2.0")}']`).click(); // Re-select P1-Q1, A
    cy.get("[data-testid='nextButton']").click();

    // Verify Review Page Shows only "P1-Q1, A" data and not "P1-Q1, B" data
    cy.get("h2").contains("Review your answers before submitting the form.");
  });
});
