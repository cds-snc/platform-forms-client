import React from "react";
import { AddElementButton } from "../AddElementButton";

describe("<AddElementButton />", () => {
  beforeEach(() => {
    cy.intercept("/api/flags/experimentalBlocks/check", { status: true });
  });

  it("opens the add element dialog", () => {
    cy.mount(<AddElementButton />);

    cy.get('[data-testid="add-element"]').should("exist");
    cy.get('[data-testid="add-element"]').click();

    cy.get("dialog").should("exist");
  });
});
