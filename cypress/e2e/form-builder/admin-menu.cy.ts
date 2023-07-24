import { NextData } from "types";

describe("Form ownership", () => {
  beforeEach(() => {
    cy.visit("/form-builder", {
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

  it("Shows admin menu when logged in as Admin", () => {
    cy.login({ admin: true, acceptableUse: true });
    cy.visit("/myforms");

    cy.get("div[data-testid='yourAccountDropdown']").click();
    cy.get("[data-testid='yourAccountDropdownContent']").should("contain", "Administration");
  });

  it("Does not show admin menu when logged in as non-Admin", () => {
    cy.login({ acceptableUse: true });
    cy.visit("/myforms");

    cy.get("div[data-testid='yourAccountDropdown']").click();
    cy.get("[data-testid='yourAccountDropdownContent']").should("not.contain", "Administration");
  });
});
