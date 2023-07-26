import React from "react";
import * as Alert from "./Alert";
import { CircleCheckIcon } from "../../form-builder/icons";

describe("<Alert />", () => {
  it("Renders a basic alert with title and body", () => {
    cy.viewport(1000, 400);
    cy.mount(<Alert.Warning title="This is a title" body="This is a body" />);
  });

  it("Renders a basic alert with no title", () => {
    cy.viewport(1000, 400);
    cy.mount(<Alert.Info body="This is a body" />);
  });

  it("Renders a complex alert", () => {
    cy.viewport(1000, 400);
    cy.mount(
      <>
        <Alert.Success>
          <Alert.Icon>
            <CircleCheckIcon />
          </Alert.Icon>
          <Alert.Title level="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
          Just some text
          <p>And a paragraph</p>
        </Alert.Success>
      </>
    );
  });
});
