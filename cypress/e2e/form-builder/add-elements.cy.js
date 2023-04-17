describe("Test FormBuilder Add Elements", () => {
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

  it("Adds a Page Text element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="richText"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[data-testid="richText"]').exists;
  });

  it("Adds a Short Answer element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get(".example-text").should("contain", "Short answer");
  });

  it("Adds a Long Answer element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textArea"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get(".example-text").should("contain", "Long answer text");
  });

  it("Adds a Single choice element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="radio"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Radio buttons");
  });

  it("Adds a Multiple choice element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="checkbox"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Multiple choice");
  });

  it("Adds a Dropdown list element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="dropdown"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Dropdown");
  });

  it("Adds a Date element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="date"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get('[data-testid="description-text"]').should(
      "contain",
      "Enter a date. For example: mm/dd/yyyy"
    );
    cy.get('[data-testid="date"]').should("contain", "mm/dd/yyyy");
  });

  it("Adds a Numeric field element", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="number"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[id="item-1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Question");

    cy.get('[data-testid="description-text"]').should("contain", "Only enter numbers");
    cy.get('[data-testid="number"]').should("contain", "0123456789");

    cy.visit("/form-builder/preview");
    cy.get('[data-testid="textInput"]').should("have.attr", "type", "number");
  });
});
