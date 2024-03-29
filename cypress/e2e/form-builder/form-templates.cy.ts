describe("Test FormBuilder", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder");
  });

  it("Adds a Name block with autocomplete", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="name"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-1"]').should("contain", "Full name");

    cy.visitPage("/form-builder/preview");
    cy.get('[data-testid="textInput"]').should("have.attr", "autocomplete", "name");
  });

  it("Adds a Name (3 fields) block with autocomplete", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="firstMiddleLastName"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "First name");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "Middle name");
    cy.get('[data-testid="autocomplete-4"]').should("contain", "Last name");

    cy.visitPage("/form-builder/preview");
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
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="address"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "Address line 1");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "City, town, community");
    cy.get('[data-testid="autocomplete-4"]').should("contain", "Province, State");
    cy.get('[data-testid="autocomplete-5"]').should("contain", "Postal or zip");

    cy.visitPage("/form-builder/preview");
    cy.get('[data-testid="textInput"]').each(($el, index) => {
      if (index === 0) {
        cy.wrap($el).should("have.attr", "autocomplete", "address-line1");
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
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="contact"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "Phone number");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "Email address");

    cy.visitPage("/form-builder/preview");
    cy.get('[data-testid="textInput"]').each(($el, index) => {
      if (index === 0) {
        cy.wrap($el).should("have.attr", "autocomplete", "tel");
      } else if (index === 1) {
        cy.wrap($el).should("have.attr", "autocomplete", "email");
      }
    });
  });
});
