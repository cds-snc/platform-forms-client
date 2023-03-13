describe("Test FormBuilder Repeating set", () => {
  beforeEach(() => {
    cy.visit("/form-builder", {
      onBeforeLoad: (win) => {
        win.sessionStorage.clear();
        let nextData;
        Object.defineProperty(win, "__NEXT_DATA__", {
          set(serverSideProps) {
            serverSideProps.context = {
              user: {
                acceptableUse: false,
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

  it("Adds a Repeating set with max rows", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add block").click();

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

    cy.visit("/form-builder/preview");

    cy.get('[id="1.0.0"]').type("An answer");
    cy.get('[data-testid="add-row-button-1"]').click();

    cy.get('[id="1.1.0"]').type("Another answer");
    cy.get("button").contains("Add").should("not.exist");

    cy.get("button").contains("Delete 2").click();
    cy.get("button").contains("Add").should("exist");
  });
});
