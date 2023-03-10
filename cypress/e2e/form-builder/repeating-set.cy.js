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

  it("Adds a Repeating set", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add block").click();

    cy.get('[data-testid="dynamicRow"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item0").type("This is a repeating set");
    cy.get('[data-testid="add-element"]').contains("Add to set").click();
    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    // cy.visit("/form-builder/preview");
    // cy.get('[data-testid="textInput"]').should("have.attr", "autocomplete", "name");
  });
});
