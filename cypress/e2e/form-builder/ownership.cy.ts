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

  before(() => {
    cy.resetAll();
    cy.useForm("../../__fixtures__/cdsIntakeTestForm.json");
  });

  it("Non-Admin cannot manage Form Ownership", () => {
    cy.login(false, true);
    cy.visit("/myforms");
    cy.get("a").contains("Unnamed form file").click();
    cy.get("a").contains("Settings").click();
    cy.get("a").contains("Form management").click();
    cy.get("h2").contains("Manage ownership").should("not.exist");
  });

  it("Admin can manage Form Ownership", () => {
    cy.login(true, true);
    cy.visit("/myforms");
    cy.get("a").contains("Unnamed form file").click();
    cy.get("a").contains("Settings").click();
    cy.get("a").contains("Form management").click();
    cy.get("h2").contains("Manage ownership").should("exist");
  });

  it("Must have at least one owner", () => {
    cy.login(true, true);
    cy.visit("/myforms");
    cy.get("a").contains("Unnamed form file").click();
    cy.get("a").contains("Settings").click();
    cy.get("a").contains("Form management").click();
    cy.get("h2").contains("Manage ownership").should("exist");

    cy.get("[aria-label='Remove test.user@cds-snc.ca']").click();
    cy.get("[data-testid='save-ownership']").click();
    cy.get("[data-testid='alert']").contains("Must assign at least one user").should("exist");
  });
});
