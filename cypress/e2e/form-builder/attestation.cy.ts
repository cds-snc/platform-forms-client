describe("Form builder attestation", () => {
  beforeEach(() => {
    cy.login({ acceptableUse: true });
    cy.visitPage("/form-builder/edit");
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

    cy.visitPage("/form-builder/preview");
    cy.get("#label-1").contains("all checkboxes required").should("be.visible");
    cy.get("label").contains("Condition 1").should("be.visible");
    cy.get("label").contains("Condition 2").should("be.visible");
    cy.get("label").contains("Condition 3").should("be.visible");
  });
});
