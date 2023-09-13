import { NextData } from "types";

describe("Form builder names and titles", () => {
  beforeEach(() => {
    cy.visitPage("/form-builder/edit", {
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

  it("Autocompletes name with title on focus", () => {
    cy.get("#formTitle").type("Cypress Share Test Form");
    cy.get("#fileName").click();
    cy.get("#fileName").should("have.value", "Cypress Share Test Form");
  });

  it("Accepts a blank name", () => {
    cy.get("#formTitle").type("Cypress Share Test Form");
    cy.get("#fileName").click();
    cy.get("#fileName").clear();
    cy.get("#fileName").should("have.value", "");
  });
});
