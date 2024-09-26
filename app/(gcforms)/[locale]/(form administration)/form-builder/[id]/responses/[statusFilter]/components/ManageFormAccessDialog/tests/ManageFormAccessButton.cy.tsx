"use client";
import React from "react";
import { ManageFormAccessButton } from "../ManageFormAccessButton";

describe("ManageFormAccessButton Component", () => {
  it("should render", () => {
    cy.mount(<ManageFormAccessButton />);

    // Assert the button is rendered with correct text
    cy.contains("Manage form access").should("exist");
  });
});
