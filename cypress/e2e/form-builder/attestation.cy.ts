import { NextData } from "types";
describe("Form builder attestation", () => {
  beforeEach(() => {
    cy.visit("/form-builder/edit", {
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

  it("Renders attestation block", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="attestation"]').click();
    cy.get("button").contains("Select block").click();
    cy.get("#item-1").scrollIntoView();
    cy.get("#item-1").should("have.value", "I agree to:");
    cy.get("#option--1--1").should("have.value", "Condition 1");
    cy.get("#option--1--2").should("have.value", "Condition 2");
    cy.get("#option--1--3").should("have.value", "Condition 3");
    cy.get("#required-1-id").should("be.disabled");
    cy.get("#required-1-id").should("be.checked");

    cy.visit("/form-builder/preview");
    cy.get("#label-1").contains("all checkboxes required").should("exist");
    cy.get("label").contains("Condition 1").should("exist");
    cy.get("label").contains("Condition 2").should("exist");
    cy.get("label").contains("Condition 3").should("exist");
  });
});
