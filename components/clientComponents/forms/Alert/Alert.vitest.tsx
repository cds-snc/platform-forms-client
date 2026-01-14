/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

import { Alert } from "./Alert";
import { ErrorStatus } from "@lib/constants";

describe("Alert component", () => {
  afterEach(() => cleanup());
  const text = "This is an alert";

  it("success alert", () => {
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

  it("success warning", () => {
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

  it("error alert", () => {
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

  it("info alert", () => {
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

  it("validation alert", () => {
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
