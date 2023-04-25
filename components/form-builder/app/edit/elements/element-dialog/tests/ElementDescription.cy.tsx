import React from "react";
import { ElementDescription } from "../ElementDescription";
import { FormElementTypes } from "@lib/types";

describe("<ElementDescription />", () => {
  it("mounts", () => {
    cy.mount(
      <ElementDescription
        id={FormElementTypes.textField}
        title={"My Title"}
        handleAdd={() => <></>}
      >
        <p>Child element</p>
      </ElementDescription>
    );
  });
});
