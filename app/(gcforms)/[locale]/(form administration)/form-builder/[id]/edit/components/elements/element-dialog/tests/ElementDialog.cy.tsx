"use client";
import React from "react";
import { ElementDialog } from "../ElementDialog";

describe("<ElementDialog />", () => {
  it("adds a richText element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);
    cy.get('[data-testid="richText"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "richText");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a textField element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="textField"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "textField");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a textArea element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="textArea"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "textArea");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a radio element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="radio"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "radio");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a checkbox element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="checkbox"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "checkbox");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a dropdown element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="dropdown"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "dropdown");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a date element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="formattedDate"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "formattedDate");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a number element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="preset-filter"]').click();
    cy.get('[data-testid="number"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "number");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a attestation element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="attestation"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "attestation");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a name element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="name"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "name");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a fullName element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="firstMiddleLastName"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "firstMiddleLastName");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds an address element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="address"]').click();
    cy.get("body").type("{enter}");
    cy.get("@handleAddTypeSpy").should("have.been.calledWith", "address");
    cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds an address complete element", () => {
    //cy.viewport(950, 900);
    //const handleCloseSpy = cy.spy().as("handleCloseSpy");
    //const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");
    //cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);
    // Feature Flag is not active by default, and thus this component will not appear.
    //cy.get('[data-testid="addressComplete"]').click();
    //cy.get("body").type("{enter}");
    //cy.get("@handleAddTypeSpy").should("have.been.calledWith", "addressComplete");
    //cy.get("@handleCloseSpy").should("have.been.calledOnce");
  });

  it("adds a contact element", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="contact"]').click();
    cy.get("body").type("{enter}");
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
    cy.get("body").type("{enter}");
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

  it.skip("can tab through dialog elements", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get("body").tab();
    cy.focused().should("have.attr", "data-testid", "listbox");
    cy.get('[data-testid="listbox"').tab().tab(); // tab past the example element
    cy.focused().should("have.attr", "data-testid", "element-description-add-element");
    cy.get('[data-testid="element-description-add-element"').tab();
    cy.focused().should("have.attr", "data-testid", "cancel-button");
    cy.get('[data-testid="cancel-button"').tab();
    cy.focused().should("have.attr", "data-testid", "close-dialog");
  });

  it("can keyboard navigate through the listbox", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.get('[data-testid="all-filter"]').click();
    cy.get("body").tab().tab();
    cy.focused().should("have.attr", "data-testid", "listbox");
    cy.get('[data-testid="textField"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="textArea"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="radio"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="checkbox"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="dropdown"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="combobox"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="attestation"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="name"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="firstMiddleLastName"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="formattedDate"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="contact"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="address"]').should("have.attr", "aria-selected", "true");

    // Feature Flag is not active by default, and thus this component will not appear.
    //cy.get("body").type("{downarrow}");
    //cy.get('[data-testid="addressComplete"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="departments"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="number"]').should("have.attr", "aria-selected", "true");

    cy.get("body").type("{downarrow}");
    cy.get('[data-testid="richText"]').should("have.attr", "aria-selected", "true");
  });

  it("Keybaord navigate the filters", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.focused().should("have.attr", "data-testid", "all-filter");
    cy.get("body").type("{rightarrow}");
    cy.focused().should("have.attr", "data-testid", "basic-filter");
    cy.get("body").type("{rightarrow}");
    cy.focused().should("have.attr", "data-testid", "preset-filter");
    cy.get("body").type("{rightarrow}");
    cy.focused().should("have.attr", "data-testid", "other-filter");
    cy.get('[data-testid="other-filter"]').tab();
    cy.focused().should("have.attr", "data-testid", "listbox");
    cy.get('[data-testid="listbox"]').tab({ shift: true });
    cy.focused().should("have.attr", "data-testid", "other-filter");
    cy.get("body").type("{leftarrow}");
    cy.focused().should("have.attr", "data-testid", "preset-filter");
    cy.get("body").type("{leftarrow}");
    cy.focused().should("have.attr", "data-testid", "basic-filter");
    cy.get("body").type("{leftarrow}");
    cy.focused().should("have.attr", "data-testid", "all-filter");
  });

  it("Can filter the listbox", () => {
    cy.viewport(950, 900);

    const handleCloseSpy = cy.spy().as("handleCloseSpy");
    const handleAddTypeSpy = cy.spy().as("handleAddTypeSpy");

    cy.mount(<ElementDialog handleClose={handleCloseSpy} handleAddType={handleAddTypeSpy} />);

    cy.focused().should("have.attr", "data-testid", "all-filter");
    cy.get("body").type("{rightarrow}");
    cy.focused().should("have.attr", "data-testid", "basic-filter");
    cy.get('[data-testid="basic-filter').click();
    cy.get('[data-testid="listbox"] li[role="option"]').should("have.length", 7);
    cy.get('[data-testid="preset-filter').click();
    cy.get('[data-testid="listbox"] li[role="option"]').should("have.length", 7);

    // Other filter has 2 elements
    cy.get('[data-testid="other-filter').click();
    cy.get('[data-testid="listbox"] li[role="option"]').should("have.length", 2);

    cy.get('[data-testid="all-filter').click();
    cy.get('[data-testid="listbox"] li[role="option"]').should("have.length", 16);
  });
});
