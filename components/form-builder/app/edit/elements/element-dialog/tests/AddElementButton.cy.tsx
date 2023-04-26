import React from "react";
import { AddElementButton } from "../AddElementButton";

describe("<AddElementButton />", () => {
  it("mounts", () => {
    cy.mount(<AddElementButton />);
  });
});
