import { NextData } from "types";
// skipping this test until we re-look at this feature
describe("Test FormBuilder Repeating set", () => {
  beforeEach(() => {
    cy.useFlag("experimentalBlocks", true);
    cy.visitPage("/form-builder", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
        let nextData: NextData;
        Object.defineProperty(win, "__NEXT_DATA__", {
          set(serverSideProps) {
            serverSideProps.context = {
              user: {
                acceptableUse: true,
                name: null,
                userId: "testId",
              },
            };
            nextData = serverSideProps;
          },
          get() {
            return nextData;
          },
        });
      },
    });
  });

  it.skip("Adds a Repeating set with a few questions", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-1").type("This is a repeating set");

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.get("#item-101").type("This is a short answer question");

    cy.get('[data-testid="addToSet"]').contains("Add to set").click();
    cy.get('[data-testid="radio"]').click();
    cy.get("button").contains("Select block").click();

    cy.get("#item-102").type("This is a single choice question");
    cy.get("#option--102--1").type("This is an option");

    cy.visitPage("/form-builder/preview");
    cy.get('[id="1.0.0"]').type("An answer");

    // Can't select/click the input directly because it's covered by the label
    cy.get('label[for="1.0.1.0"]').click();
    cy.get('[id="1.0.1.0"]').should("be.checked");
  });

  it.skip("Adds a Repeating set with custom add label", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-1").type("This is a repeating set");

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.get("#repeatable-button-0").type("something");
    cy.visitPage("/form-builder/preview");

    cy.get('[data-testid="add-row-button-1"]').contains("Add something");
  });

  it.skip("Adds a Repeating set with max rows", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-1").type("This is a repeating set");

    cy.get('[data-testid="more"]').click();
    cy.get("#maxNumberOfRows--modal--0").type("2");
    cy.get("button").contains("Save").click();

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.get("#item-101").type("This is a short answer question");

    cy.visitPage("/form-builder/preview");

    cy.get('[id="1.0.0"]').type("An answer");
    cy.get('[data-testid="add-row-button-1"]').click();

    cy.get('[id="1.1.0"]').type("Another answer");
    cy.get("button").contains("Add").should("not.exist");

    cy.get("button").contains("Delete 2").click();
    cy.get("button").contains("Add").should("exist");
  });

  // re-add when we re-look at this feature
  it.skip("Adds multiple Repeating sets", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-1").type("This is a repeating set");

    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-101").type("This is a short answer question");

    cy.get('#element-1 [data-testid="add-element"]').click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-2").type("This is another repeating set");

    cy.get("#element-2").find("button").contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-201").type("This is a short answer question");

    cy.get("#element-2").find("button").contains("Add to set").click();
    cy.get('[data-testid="radio"]').click();
    cy.get("button").contains("Select block").click();

    cy.get("#item-202").type("Single choice question");
    cy.get("#option--202--1").type("Option");

    cy.visitPage("/form-builder/preview");
    cy.get('[id="1.0.0"]').type("An answer");
    cy.get('[id="2.0.0"]').type("Another answer");
    // Can't select/click the input directly because it's covered by the label
    cy.get('label[for="2.0.1.0"]').click();
  });
});
