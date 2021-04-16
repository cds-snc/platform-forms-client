import React from "react";
import { render, screen, cleanup } from "@testing-library/react";

import { Alert } from "./Alert";

describe("Alert component", () => {
  afterEach(cleanup);
  const text = "This is an alert";

  test("success alert", () => {
    render(
      <Alert type="success" heading="Success status">
        {text}
      </Alert>
    );
    expect(screen.getByRole("alert"))
      .toHaveClass("gc-alert--success")
      .toHaveTextContent(text)
      .toHaveTextContent("Success status");
  });
  test("success warning", () => {
    render(
      <Alert type="warning" heading="Warning status">
        {text}
      </Alert>
    );
    expect(screen.getByRole("alert"))
      .toHaveClass("gc-alert--warning")
      .toHaveTextContent(text)
      .toHaveTextContent("Warning status");
  });
  test("error alert", () => {
    render(
      <Alert type="error" heading="Error status">
        {text}
      </Alert>
    );
    expect(screen.getByRole("alert"))
      .toHaveClass("gc-alert--error")
      .toHaveTextContent(text)
      .toHaveTextContent("Error status");
  });
  test("info alert", () => {
    render(
      <Alert type="info" heading="Info status">
        {text}
      </Alert>
    );
    expect(screen.getByRole("alert"))
      .toHaveClass("gc-alert--info")
      .toHaveTextContent(text)
      .toHaveTextContent("Info status");
  });
  test("validation alert", () => {
    render(
      <Alert validation heading="Validation status">
        {text}
      </Alert>
    );
    expect(screen.getByRole("alert"))
      .toHaveClass("gc-alert--validation")
      .toHaveTextContent(text)
      .toHaveTextContent("Validation status");
  });
});
