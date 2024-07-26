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

  it("Renders properly", () => {
    cy.get("h1").contains("show-hide-groups-test");
  });

  // Requires Flag for "Conditional Logic" to be On
  it("Fill in data on branch A, B, C and verify Review page has correct data", () => {
    // Why CSS.escape? Without it, the Id's start with a number will throw an error in the browers.
    // The HTML spec allows a CSS selector to start with a number but browsers said "NO" I guess..

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
    cy.get("[data-testid='Beginning']").contains("Q1");
    cy.get("[data-testid='Beginning']").contains("A");
    cy.get("[data-testid='P1']").contains("P1");
    cy.get("[data-testid='P1']").contains("P1-Q1");
    cy.get("[data-testid='P1']").contains("P1-Q1-A");
    cy.get("[data-testid='P1']").should("not.contain", "P1-Q1-B");

    // Go back to Start and Fill in data for Branch B
    cy.get("[data-testid='Beginning'] h3 button").click();
    cy.get(`[for='${CSS.escape("1.1")}']`).click(); // Select B
    cy.get("[data-testid='nextButton']").click();
    cy.get("h2").contains("P2");
    cy.get(`[for='${CSS.escape("5.0")}']`).click(); // Select P2-Q1, A
    cy.typeInField(`[for='${CSS.escape("6")}']`, "P2-Q1-A");
    cy.get(`[for='${CSS.escape("5.1")}']`).click(); // Select P2-Q1, B
    cy.typeInField(`[for='${CSS.escape("7")}']`, "P2-Q1-B");
    cy.get(`[for='${CSS.escape("5.0")}']`).click(); // Select P2-Q1, A
    cy.get("[data-testid='nextButton']").click();

    // Verify Review Page Shows only "P2-Q1, A" data and not "P1-Q1, A or B" data
    cy.get("h2").contains("Review your answers before submitting the form.");
    cy.get("[data-testid='Beginning']").contains("Q1");
    cy.get("[data-testid='Beginning']").contains("B");
    cy.get("[data-testid='P2']").contains("P2");
    cy.get("[data-testid='P2']").contains("P2-Q1");
    cy.get("[data-testid='P2']").contains("P2-Q1-A");
    cy.get("[data-testid='P2']").should("not.contain", "P1-Q1-A");
    cy.get("[data-testid='P2']").should("not.contain", "P1-Q1-B");
    cy.get("[data-testid='P2']").should("not.contain", "P2-Q1-B");

    /*

    // Go back to Start and Fill in data for Branch C
    cy.get("[data-testid='Beginning'] button").eq(1).click();
    cy.get(`[for='${CSS.escape("1.2")}']`).click(); // Select C
    cy.get("[data-testid='nextButton']").click();
    cy.get("h2").contains("P3");
    cy.get(`[for='${CSS.escape("8.0")}']`).click(); // Select P3-Q1, A
    cy.typeInField(`[for='${CSS.escape("9")}']`, "P3-Q1-A");
    cy.get(`[for='${CSS.escape("8.1")}']`).click(); // Select P3-Q1, B
    cy.typeInField(`[for='${CSS.escape("10")}']`, "P3-Q1-B");
    cy.get(`[for='${CSS.escape("8.0")}']`).click(); // Select P3-Q1, A
    cy.get("[data-testid='nextButton']").click();

    // Verify Review Page Shows only "P3-Q1, A" data and not "P1-Q1, A or B"
    // and not "P2-Q1, A or B" data
    cy.get("h2").contains("Review your answers before submitting the form.");
    cy.get("[data-testid='Beginning']").contains("Q1");
    cy.get("[data-testid='Beginning']").contains("C");
    cy.get("[data-testid='P3']").contains("P3");
    cy.get("[data-testid='P3']").contains("P3-Q1");
    cy.get("[data-testid='P3']").contains("P3-Q1-A");
    cy.get("[data-testid='P3']").should("not.contain", "P1-Q1-A");
    cy.get("[data-testid='P3']").should("not.contain", "P1-Q1-B");
    cy.get("[data-testid='P3']").should("not.contain", "P2-Q1-A");
    cy.get("[data-testid='P3']").should("not.contain", "P2-Q1-B");
    cy.get("[data-testid='P3']").should("not.contain", "P3-Q1-B");

    // Go back to Start and select Branch A, use existing data
    cy.get("[data-testid='Beginning'] h3 button").click();
    cy.get(`[for='${CSS.escape("1.0")}']`).click(); // Select C
    cy.get("[data-testid='nextButton']").click();
    cy.get(`[for='${CSS.escape("2.0")}']`).click(); // Select P1-Q1, A
    cy.get("[data-testid='nextButton']").click();

    // Verify Review Page Shows only "P1-Q1, A" data and not "P1-Q1, B" and not "P2-Q1, A or B"
    // and not "P3-Q1, A or B" data
    cy.get("h2").contains("Review your answers before submitting the form.");
    cy.get("[data-testid='Beginning']").contains("Q1");
    cy.get("[data-testid='Beginning']").contains("A");
    cy.get("[data-testid='P1']").contains("P1");
    cy.get("[data-testid='P1']").contains("P1-Q1");
    cy.get("[data-testid='P1']").contains("P1-Q1-A");
    cy.get("[data-testid='P1']").should("not.contain", "P1-Q1-B");
    cy.get("[data-testid='P1']").should("not.contain", "P2-Q1-A");
    cy.get("[data-testid='P1']").should("not.contain", "P2-Q1-B");
    cy.get("[data-testid='P1']").should("not.contain", "P3-Q1-A");
    cy.get("[data-testid='P1']").should("not.contain", "P3-Q1-B");

    */
  });

  // cy.get("[data-testid='Beginning'] button").eq(1).click();
});
