describe("Form builder description text", () => {
  beforeEach(() => {
    cy.visit("/form-builder/edit", {
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

  it("Renders phone element with example text", () => {
    cy.get("button").contains("Add element").click();
    cy.get(".builder-element-dropdown").click();
    cy.get('[data-testid="phone"]').click();
    cy.get(".description-text").should("exist").contains("Enter a phone number like, 111-222-3333");
    cy.get(".example-text").should("exist").contains("111-222-3333");
  });

  it("Renders email element with example text", () => {
    cy.get("button").contains("Add element").click();
    cy.get(".builder-element-dropdown").click();
    cy.get('[data-testid="email"]').click();
    cy.get(".description-text")
      .should("exist")
      .contains("Enter an email address like, name@example.com");
    cy.get(".example-text").should("exist").contains("name@example.com");
  });

  it("Renders date element with example text", () => {
    cy.get("button").contains("Add element").click();
    cy.get(".builder-element-dropdown").click();
    cy.get('[data-testid="date"]').click();
    cy.get(".description-text").should("exist").contains("Enter a date like, mm/dd/yyyy");
    cy.get(".example-text").should("exist").contains("mm/dd/yyyy");
  });

  it("Renders numeric element with example text", () => {
    cy.get("button").contains("Add element").click();
    cy.get(".builder-element-dropdown").click();
    cy.get('[data-testid="number"]').click();
    cy.get(".description-text").should("exist").contains("Only enter numbers");
    cy.get(".example-text").should("exist").contains("0123456789");
  });
});
