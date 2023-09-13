import { NextData } from "types";

describe("Form builder description text", () => {
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

  it("Renders date element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="date"]').click();
    cy.get("button").contains("Select block").click();
    cy.get(".description-text").should("exist").contains("Enter a date. For example: mm/dd/yyyy");
    cy.get(".example-text").should("exist").contains("mm/dd/yyyy");
  });

  it("Renders numeric element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="number"]').click();
    cy.get("button").contains("Select block").click();
    cy.get(".description-text").should("exist").contains("Only enter numbers");
    cy.get(".example-text").should("exist").contains("0123456789");
  });
});
