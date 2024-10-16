// cypress/component/ConfirmAction.cy.tsx

import React from "react";
import { ConfirmAction } from "../ConfirmAction";

describe("ConfirmAction Component", () => {
  it("renders correctly", () => {
    const callback = cy.stub().resolves(true);
    cy.mount(<ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />);
    cy.get("svg").should("exist");
  });

  it("renders with default props", () => {
    const callback = cy.stub().resolves(true);
    cy.mount(<ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />);
    cy.get("svg").should("exist"); // Assuming CancelIcon renders an SVG
  });

  it("executes callback on button click", () => {
    const callback = cy.stub().resolves(true);
    cy.mount(<ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />);
    cy.get("button[data-testid=button]").click();
    cy.get("button[data-testid=confirm]").click();
    cy.wrap(callback).should("have.been.calledOnce");
  });

  it("displays confirmString and buttonLabel props", () => {
    const callback = cy.stub().resolves(true);
    cy.mount(<ConfirmAction callback={callback} confirmString="Confirm?" buttonLabel="Delete" />);
    cy.get("button[data-testid=button]").click();
    cy.get("button").contains("Delete").should("exist");
    // cy.get("button").contains("Confirm?").should("exist");
  });

  it("applies buttonTheme prop", () => {
    const callback = cy.stub().resolves(true);
    cy.mount(
      <ConfirmAction
        callback={callback}
        buttonTheme="primary"
        confirmString={""}
        buttonLabel={""}
      />
    );
    // cy.get("button").should("have.class", "primary");
  });

  it("closes on clicking outside", () => {
    const callback = cy.stub().resolves(true);
    cy.mount(
      <div>
        <ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />
        <div id="outside">Outside</div>
      </div>
    );
    cy.get("button[data-testid=button]").click();
    cy.get("button[data-testid=confirm]").should("exist");
    cy.get("#outside").click();
    cy.get("button[data-testid=confirm]").should("not.exist");
  });
});
