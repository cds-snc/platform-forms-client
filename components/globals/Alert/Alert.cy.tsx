import React from "react";
import * as Alert from "./Alert";
import { CircleCheckIcon, CopyIcon } from "../../form-builder/icons";

describe("<Alert />", () => {
  it("Renders a basic alert with title, body, and custom icon", () => {
    cy.viewport(1000, 400);
    cy.mount(<Alert.Warning title="This is a title" body="This is a body" icon={<CopyIcon />} />);
  });

  it("Renders a basic alert with title, body, and default icon", () => {
    cy.viewport(1000, 400);
    cy.mount(<Alert.Warning title="This is a title" body="This is a body" />);
  });

  it("Renders a basic alert with title, body, and no icon", () => {
    cy.viewport(1000, 400);
    cy.mount(<Alert.Warning title="This is a title" body="This is a body" icon={false} />);
  });

  it("Renders an alert with mix of props and children", () => {
    cy.viewport(1000, 400);
    // Title prop should be overridden by child Alert.Title
    // Para text should be appended after body prop
    // Default icon should be used
    cy.mount(
      <>
        <Alert.Warning title="This is a title" body="This is a body">
          <Alert.Title level="h3">Test Title</Alert.Title>
          <p>And a paragraph</p>
        </Alert.Warning>
      </>
    );
  });

  it("Renders a basic alert with no title", () => {
    cy.viewport(1000, 400);
    cy.mount(<Alert.Info body="This is a body" />);
  });

  it("Renders an alert with default Icon", () => {
    cy.viewport(1000, 400);
    cy.mount(
      <>
        <Alert.Info>
          <Alert.Title level="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
          Just some text
          <p>And a paragraph</p>
        </Alert.Info>
      </>
    );
  });

  it("Renders an alert with no icon", () => {
    cy.viewport(1000, 400);
    cy.mount(
      <>
        <Alert.Success icon={false}>
          <Alert.Title level="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      </>
    );
  });

  it("Renders an alert with default icon", () => {
    cy.viewport(1000, 400);
    cy.mount(
      <>
        <Alert.Success>
          <Alert.Title level="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      </>
    );
  });

  it("Renders a complex alert with custom icon", () => {
    cy.viewport(1000, 400);
    cy.mount(
      <>
        <Alert.Success>
          <Alert.Icon>
            <CircleCheckIcon />
          </Alert.Icon>
          <Alert.Title level="h3">Test Title</Alert.Title>
          <Alert.Body>Test body</Alert.Body>
        </Alert.Success>
      </>
    );
  });

  it("Renders a dismissible alert", () => {
    cy.mount(<Alert.Success dismissible title="This is a title" body="This is a body" />);
  });

  it("Renders a complex alert", () => {
    cy.mount(
      <Alert.Success>
        <Alert.Icon>
          <CircleCheckIcon />
        </Alert.Icon>
        <Alert.Title level="h3">Test Title</Alert.Title>
        <Alert.Body>Test body</Alert.Body>
        Just some text
        <p>And a paragraph</p>
      </Alert.Success>
    );
  });
});
