import React from "react";
import { Overlay } from "./Overlay";

// see: https://on.cypress.io/mounting-react

describe("<Ovleray />", () => {
  it("Opens and closes as expected", () => {
    cy.mount(<Overlay />);

    cy.get(`[data-testid="overlay"]`).should("be.visible");
  });

  it("clicking executes the passed callback", () => {
    let callbackCalled = false;
    const callback = () => {
      callbackCalled = true;
    };

    cy.mount(<Overlay callback={callback} />);

    cy.get(`[data-testid="overlay"]`).should("be.visible");
    cy.get(`[data-testid="overlay"]`).click();
    cy.get(`[data-testid="overlay"]`).then(() => {
      assert.isTrue(callbackCalled);
    });
  });
});
