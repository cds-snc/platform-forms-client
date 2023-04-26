import React from "react";
import { ElementDialog } from "../ElementDialog";

describe("<ElementDialog />", () => {
  it("adds a richText element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="richText"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "richText");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");

    // cy.get('[data-testid="textField"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "textField");
    // cy.get("@handleCloseSpy").should("have.been.calledOnce");

    // cy.get('[data-testid="textArea"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "textArea");
    // cy.get("@handleCloseSpy").should("have.been.calledOnce");

    // cy.get('[data-testid="radio"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "radio");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="checkbox"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "checkbox");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="dropdown"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "dropdown");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="date"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "date");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="number"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "number");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="attestation"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "attestation");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="name"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "name");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="firstMiddleLastName"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "firstMiddleLastName");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="address"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "address");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get('[data-testid="contact"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "contact");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // Not sure how to turn on Feature Flags in Cypress Component tests
    // cy.get('[data-testid="dynamicRow"]').click();
    // cy.get('[data-testid="element-description-add-element"]').click();
    // cy.get("@handleAddTypeSpy").should("have.been.calledWith", "dynamicRow");
    // cy.get("@handleCloseSpy").should("have.been.called");

    // cy.get("@handleCloseSpy").should("have.been.called");
  });

  it("adds a textField element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="textField"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "textField");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a textArea element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="textArea"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "textArea");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a radio element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="radio"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "radio");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a checkbox element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="checkbox"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "checkbox");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a dropdown element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="dropdown"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "dropdown");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a date element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="date"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "date");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a number element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="number"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "number");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a attestation element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="attestation"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "attestation");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a name element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="name"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "name");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a fullName element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="firstMiddleLastName"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "firstMiddleLastName");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds an address element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="address"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "address");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a contact element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="contact"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "contact");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it.skip("adds a dynamicRow contact element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    // Not sure how to turn on Feature Flags in Cypress Component tests ??
    cy.get('[data-testid="dynamicRow"]').click();
    cy.get('[data-testid="element-description-add-element"]').click();
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "dynamicRow");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("closes the dialog", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="close-dialog"]').click();
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });
});
