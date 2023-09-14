// skipping this test until we re-look at this feature
describe("Test FormBuilder Repeating set", () => {
  beforeEach(() => {
    cy.useFlag("experimentalBlocks", true);
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder");
  });

  it.skip("Adds a Repeating set with a few questions", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-1", "This is a repeating set");

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.typeInField("#item-101", "This is a short answer question");

    cy.get('[data-testid="addToSet"]').contains("Add to set").click();
    cy.get('[data-testid="radio"]').click();
    cy.get("button").contains("Select block").click();

    cy.typeInField("#item-102", "This is a single choice question");
    cy.typeInField("#option--102--1", "This is an option");

    cy.visitPage("/form-builder/preview");
    cy.typeInField('[id="1.0.0"]', "An answer");

    // Can't select/click the input directly because it's covered by the label
    cy.get('label[for="1.0.1.0"]').click();
    cy.get('[id="1.0.1.0"]').should("be.checked");
  });

  it.skip("Adds a Repeating set with custom add label", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-1", "This is a repeating set");

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.typeInField("#repeatable-button-0", "something");
    cy.visitPage("/form-builder/preview");

    cy.get('[data-testid="add-row-button-1"]').contains("Add something");
  });

  it.skip("Adds a Repeating set with max rows", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-1", "This is a repeating set");

    cy.get('[data-testid="more"]').click();
    cy.typeInField("#maxNumberOfRows--modal--0", "2");
    cy.get("button").contains("Save").click();

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.typeInField("#item-101", "This is a short answer question");

    cy.visitPage("/form-builder/preview");

    cy.typeInField('[id="1.0.0"]', "An answer");
    cy.get('[data-testid="add-row-button-1"]').click();

    cy.typeInField('[id="1.1.0"]', "Another answer");
    cy.get("button").contains("Add").should("not.exist");

    cy.get("button").contains("Delete 2").click();
    cy.get("button").contains("Add").should("be.visible");
  });

  // re-add when we re-look at this feature
  it.skip("Adds multiple Repeating sets", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-1", "This is a repeating set");

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-101", "This is a short answer question");

    cy.get('#element-1 [data-testid="add-element"]').click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-2", "This is another repeating set");

    cy.get("#element-2").find("button").contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();
    cy.typeInField("#item-201", "This is a short answer question");

    cy.get("#element-2").find("button").contains("Add to set").click();
    cy.get('[data-testid="radio"]').click();
    cy.get("button").contains("Select block").click();

    cy.typeInField("#item-202", "Single choice question");
    cy.typeInField("#option--202--1", "Option");

    cy.visitPage("/form-builder/preview");
    cy.typeInField('[id="1.0.0"]', "An answer");
    cy.typeInField('[id="2.0.0"]', "Another answer");
    // Can't select/click the input directly because it's covered by the label
    cy.get('label[for="2.0.1.0"]').click();
  });
});
