"use client";
import React from "react";
import { AddElementButton } from "../AddElementButton";

describe("<AddElementButton />", () => {
  it("opens the add element dialog", () => {
    cy.mount(<AddElementButton />);

    cy.get('[data-testid="add-element"]').should("be.visible");
    cy.get('[data-testid="add-element"]').click();

    cy.get("dialog").should("be.visible");
  });
});
