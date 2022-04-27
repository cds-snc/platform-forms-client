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
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("gc-alert--success");
    expect(alert).toHaveTextContent(text);
    expect(alert).toHaveTextContent("Success status");
  });
  test("success warning", () => {
    render(
      <Alert type="warning" heading="Warning status">
        {text}
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("gc-alert--warning");
    expect(alert).toHaveTextContent(text);
    expect(alert).toHaveTextContent("Warning status");
  });
  test("error alert", () => {
    render(
      <Alert type="error" heading="Error status">
        {text}
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("gc-alert--error");
    expect(alert).toHaveTextContent(text);
    expect(alert).toHaveTextContent("Error status");
  });
  test("info alert", () => {
    render(
      <Alert type="info" heading="Info status">
        {text}
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("gc-alert--info");
    expect(alert).toHaveTextContent(text);
    expect(alert).toHaveTextContent("Info status");
  });
  test("validation alert", () => {
    render(
      <Alert validation heading="Validation status">
        {text}
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("gc-alert--validation");
    expect(alert).toHaveTextContent(text);
    expect(alert).toHaveTextContent("Validation status");
  });
});
