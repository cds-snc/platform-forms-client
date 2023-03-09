describe("Test FormBuilder", () => {
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

  it("Adds a Name block with autocomplete", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add block").click();

    cy.get('[data-testid="name"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[data-testid="autocomplete-1"]').should("contain", "Full name");

    cy.visit("/form-builder/preview");
    cy.get('[data-testid="textInput"]').should("have.attr", "autocomplete", "name");
  });

  it("Adds a Name (3 fields) block with autocomplete", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add block").click();

    cy.get('[data-testid="firstMiddleLastName"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[data-testid="autocomplete-1"]').should("contain", "Last name");
    cy.get('[data-testid="autocomplete-2"]').should("contain", "Middle name");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "First name");

    cy.visit("/form-builder/preview");
    cy.get('[data-testid="textInput"]').each(($el, index) => {
      if (index === 0) {
        cy.wrap($el).should("have.attr", "autocomplete", "given-name");
      } else if (index === 1) {
        cy.wrap($el).should("have.attr", "autocomplete", "additional-name");
      } else if (index === 2) {
        cy.wrap($el).should("have.attr", "autocomplete", "family-name");
      }
    });
  });

  it("Adds a Address block with autocomplete", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add block").click();

    cy.get('[data-testid="address"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[data-testid="autocomplete-1"]').should("contain", "Postal or zip");
    cy.get('[data-testid="autocomplete-2"]').should("contain", "Province, State");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "City, town, community");
    cy.get('[data-testid="autocomplete-4"]').should("contain", "Full street address");

    cy.visit("/form-builder/preview");
    cy.get('[data-testid="textInput"]').each(($el, index) => {
      if (index === 0) {
        cy.wrap($el).should("have.attr", "autocomplete", "street-address");
      } else if (index === 1) {
        cy.wrap($el).should("have.attr", "autocomplete", "address-level2");
      } else if (index === 2) {
        cy.wrap($el).should("have.attr", "autocomplete", "address-level1");
      } else if (index === 3) {
        cy.wrap($el).should("have.attr", "autocomplete", "postal-code");
      }
    });
  });

  it("Adds a Contact block with autocomplete", () => {
    cy.visit("/form-builder/edit");
    cy.get("button").contains("Add block").click();

    cy.get('[data-testid="contact"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "Email address");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "Phone number");

    cy.visit("/form-builder/preview");
    cy.get('[data-testid="textInput"]').each(($el, index) => {
      if (index === 0) {
        cy.wrap($el).should("have.attr", "autocomplete", "phone");
      } else if (index === 1) {
        cy.wrap($el).should("have.attr", "autocomplete", "email");
      }
    });
  });
});
