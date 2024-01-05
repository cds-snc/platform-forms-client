describe("Test FormBuilder autocomplete props", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder");
  });

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
    ["name", "Full name (includes first, middle and last names)"],
    ["organization-title", "Job title"],
    ["tel", "Phone number"],
    ["postal-code", "Postal or zip code"],
    ["street-address", "Full street address (includes address lines 1-3)"],
    ["url", "Website address"],
  ];

  it("Checks the autocomplete list", () => {
    cy.visitPage("/form-builder/edit");
    cy.get("button").contains("Add").click();

    cy.get('[data-testid="textField"]').click();
    cy.get("button").contains("Select block").click();

    cy.get('[data-testid="more"]').click();
    cy.get('[data-testid="autocomplete"] > option').should(
      "have.length",
      autocompleteOptions.length + 1
    );
  });

  autocompleteOptions.forEach((option) => {
    it(`Adds a TextAreaInput with ${option[0]} autocomplete`, () => {
      cy.visitPage("/form-builder/edit");
      cy.get("button").contains("Add").click();

      cy.get('[data-testid="textField"]').click();
      cy.get("button").contains("Select block").click();

      cy.get('[id="item-1"]').should("have.attr", "placeholder", "Question");

      cy.get(".example-text").should("contain", "Short answer");

      cy.get('[data-testid="more"]').click();
      cy.get('[data-testid="autocomplete"]').select(option[0]);

      cy.get('[data-testid="more-modal-save-button"]').contains("Save").click();
      cy.get('[data-testid="autocomplete-1"]').should("contain", option[1]);

      cy.visitPage("/form-builder/preview");
      cy.get('[data-testid="textInput"]').should("have.attr", "autocomplete", option[0]);
    });
  });
});
