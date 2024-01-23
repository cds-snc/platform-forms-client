describe("Test FormBuilder Add Elements", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder");
  });

  it("Adds a Page Text element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="richText"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="richText"]').should("be.visible");
  });

  it("Adds a Short Answer element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textField"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get(".example-text").should("contain", "Short answer");
  });

  it("Adds a Long Answer element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textArea"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get(".example-text").should("contain", "Long answer");
  });

  it("Adds a Single choice element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="radio"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Radio buttons");
  });

  it("Adds a Multiple choice element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="checkbox"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]').should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Checkboxes");
  });

  it("Adds a Dropdown list element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="basic-filter"]').click();
    cy.get('[data-testid="dropdown"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]').should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Dropdown");
  });

  it("Adds a Date element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="date"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[data-testid="description-text"]').should("contain", "Format the date as: mm/dd/yyyy");
    cy.get('[data-testid="date"]').should("contain", "mm/dd/yyyy");
  });

  it("Adds a Numeric field element", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="number"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[data-testid="description-text"]').should("contain", "Enter a number");
    cy.get('[data-testid="number"]').should("contain", "0123456789");

    cy.visitPage("/form-builder/preview");
    cy.get('[data-testid="textInput"]').should("have.attr", "type", "number");
  });
});
