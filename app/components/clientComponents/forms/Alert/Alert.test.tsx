import React from "react";
import { render, screen, cleanup } from "@testing-library/react";

import { Alert, ErrorStatus } from "./Alert";

describe("Alert component", () => {
  afterEach(cleanup);
  const text = "This is an alert";

  test("success alert", () => {
    render(
      <Alert type={ErrorStatus.SUCCESS} heading="Success status">
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
      <Alert type={ErrorStatus.WARNING} heading="Warning status">
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
      <Alert type={ErrorStatus.ERROR} heading="Error status">
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
      <Alert type={ErrorStatus.INFO} heading="Info status">
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
      <Alert type={ErrorStatus.ERROR} validation heading="Validation status">
        {text}
      </Alert>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("gc-alert--validation");
    expect(alert).toHaveTextContent(text);
    expect(alert).toHaveTextContent("Validation status");
  });
});
