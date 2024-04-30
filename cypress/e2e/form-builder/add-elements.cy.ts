describe("Test FormBuilder Add Elements", () => {
  beforeEach(() => {
    cy.visitPage("/en/form-builder/0000/edit");
  });

  it("Adds a Page Text element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="richText"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="richText"]').should("be.visible");
  });

  it("Adds a Short Answer element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textField"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get(".example-text").should("contain", "Short answer");
  });

  it("Adds a Long Answer element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textArea"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get(".example-text").should("contain", "Long answer");
  });

  it("Adds a Single choice element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="radio"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]')
      .should("have.attr", "type", "text")
      .should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Radio buttons");
  });

  it("Adds a Multiple choice element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="checkbox"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]').should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Checkboxes");
  });

  it("Adds a Dropdown list element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="basic-filter"]').click();
    cy.get('[data-testid="dropdown"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[id="option--1--1"]').should("have.attr", "placeholder", "Option 1");

    cy.get(".example-text").should("contain", "Dropdown");
  });

  it("Adds a Date element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="date"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[data-testid="description-text"]').should("contain", "Format the date as: mm/dd/yyyy");
    cy.get('[data-testid="date"]').should("contain", "mm/dd/yyyy");
  });

  it("Adds a Numeric field element", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="number"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

    cy.get('[data-testid="description-text"]').should("contain", "Enter a number");
    cy.get('[data-testid="number"]').should("contain", "0123456789");

    cy.visitPage("/en/form-builder/0000/preview");
    cy.get('[data-testid="textInput"]').should("have.attr", "type", "number");
  });
  it("Renders attestation block", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="basic-filter"]').click();
    cy.get('[data-testid="attestation"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("#item-1").scrollIntoView();
    cy.get("#item-1").should("have.value", "I agree to:");
    cy.get("#option--1--1").should("have.value", "Condition 1");
    cy.get("#option--1--2").should("have.value", "Condition 2");
    cy.get("#option--1--3").should("have.value", "Condition 3");
    cy.get("#required-1-id").should("be.disabled");
    cy.get("#required-1-id").should("be.checked");

    cy.visitPage("/en/form-builder/0000/preview");
    cy.get("#label-1").contains("all checkboxes required").should("be.visible");
    cy.get("label").contains("Condition 1").should("be.visible");
    cy.get("label").contains("Condition 2").should("be.visible");
    cy.get("label").contains("Condition 3").should("be.visible");
  });
  it("Renders date element with example text", () => {
    cy.get("button").contains("Add").click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="date"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get(".description-text").should("be.visible").contains("Format the date as: mm/dd/yyyy");
    cy.get(".example-text").should("be.visible").contains("mm/dd/yyyy");
  });
  it("Renders matching element description in more modal", () => {
    // see https://github.com/cds-snc/platform-forms-client/issues/2017

    cy.get("button").contains("Add").click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="date"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get(".description-text").should("be.visible").contains("Format the date as: mm/dd/yyyy");
    cy.get(".example-text").should("be.visible").contains("mm/dd/yyyy");

    cy.get('#element-1 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("mm/dd/yyyy");
    cy.get("button").contains("Close").click();

    cy.get("button").contains("Add").click();
    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="number"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get(".description-text").should("be.visible").contains("Enter a number");
    cy.get(".example-text").should("be.visible").contains("0123456789");

    cy.get('#element-2 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("Enter a number");
    cy.get("button").contains("Close").click();

    // rearrange the first element
    cy.get('#element-2 [data-testid="moveDown"]').click();

    // check that the descriptions are still correct
    cy.get('#element-1 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("mm/dd/yyyy");
    cy.get("button").contains("Close").click();

    cy.get('#element-2 [data-testid="more"]').click();
    cy.get('[data-testid="description-input"]').contains("Enter a number");
    cy.get("button").contains("Close").click();
  });
  it("Adds a Name block with autocomplete", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="name"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-1"]').should("contain", "Full name");

    cy.visitPage("/en/form-builder/0000/preview");
    cy.get('[data-testid="textInput"]').should("have.attr", "autocomplete", "name");
  });

  it("Adds a Name (3 fields) block with autocomplete", () => {
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="firstMiddleLastName"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "First name");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "Middle name");
    cy.get('[data-testid="autocomplete-4"]').should("contain", "Last name");

    cy.visitPage("/en/form-builder/0000/preview");
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
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="address"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "Address line 1");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "City, town, community");
    cy.get('[data-testid="autocomplete-4"]').should("contain", "Province, State");
    cy.get('[data-testid="autocomplete-5"]').should("contain", "Postal or zip");

    cy.visitPage("/en/form-builder/0000/preview");
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
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="contact"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();

    cy.get('[data-testid="autocomplete-2"]').should("contain", "Phone number");
    cy.get('[data-testid="autocomplete-3"]').should("contain", "Email address");

    cy.visitPage("/en/form-builder/0000/preview");
    cy.get('[data-testid="textInput"]').each(($el, index) => {
      if (index === 0) {
        cy.wrap($el).should("have.attr", "autocomplete", "tel");
      } else if (index === 1) {
        cy.wrap($el).should("have.attr", "autocomplete", "email");
      }
    });
  });
  describe("Test FormBuilder autocomplete props", () => {
    const autocompleteOptions = [
      ["additional-name", "Middle name"],
      ["address-level1", "Province, State"],
      ["address-level2", "City, town, community"],
      ["address-line1", "Address line 1 (civic number and street name)"],
      ["address-line2", "Address line 2 (apartment or suite)"],
      ["address-line3", "Address line 3 (other address details)"],
      ["bday", "Date of birth"],
      ["bday-day", "Birth day"],
      ["bday-month", "Birth month"],
      ["bday-year", "Birth year"],
      ["country", "Country code (2 letter country identifier)"],
      ["country-name", "Country"],
      ["email", "Email address"],
      ["family-name", "Last name"],
      ["given-name", "First name"],
      ["honorific-prefix", "Name prefix, Mr, Mrs, Dr"],
      ["honorific-suffix", "Name suffix, Jr, B.Sc,"],
      ["language", "Language"],
      ["name", "Full name (includes first, middle, and last names"],
      ["organization-title", "Job title"],
      ["tel", "Phone number"],
      ["postal-code", "Postal or zip code"],
      ["url", "Website address"],
    ];

    it("Checks the autocomplete list", () => {
      cy.get("button").contains("Add").click();
      cy.get('[data-testid="dialog"]').should("be.visible");
      cy.get('[data-testid="textField"]').click();
      cy.get('[data-testid="element-description-add-element"]').click();

      cy.get('[data-testid="more"]').click();
      cy.get('[data-testid="autocomplete"] > option').should(
        "have.length",
        autocompleteOptions.length + 1
      );
    });

    autocompleteOptions.forEach((option) => {
      it(`Adds a TextAreaInput with ${option[0]} autocomplete`, () => {
        cy.get("button").contains("Add").click();
        cy.get('[data-testid="dialog"]').should("be.visible");

        cy.get('[data-testid="textField"]').should("be.visible").click();
        cy.get('[data-testid="element-description-add-element"]').click();

        cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

        cy.get(".example-text").should("contain", "Short answer");

        cy.get('[data-testid="more"]').click();
        cy.get('[data-testid="autocomplete"]').select(option[0]);

        cy.get('[data-testid="more-modal-save-button"]').contains("Save").click();
        cy.get('[data-testid="autocomplete-1"]').should("contain", option[1]);

        cy.visitPage("/en/form-builder/0000/preview");
        cy.get('[data-testid="textInput"]').should("have.attr", "autocomplete", option[0]);
      });
    });
  });
});
