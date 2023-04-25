import React from "react";
import { ElementDialog } from "../ElementDialog";

describe("<ElementDialog />", () => {
  it("mounts", () => {
    cy.viewport(950, 900);
    cy.mount(
      <ElementDialog
        handleClose={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    );
  });
});
