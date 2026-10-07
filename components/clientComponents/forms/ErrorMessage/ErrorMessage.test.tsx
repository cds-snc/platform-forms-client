/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { describe, it, expect, afterAll } from "vitest";
import { ErrorMessage } from "@clientComponents/forms";

describe("ErrorMessage component", () => {
  afterAll(() => cleanup());
  const text = "This is an error";
  it("renders without errors", () => {
    render(<ErrorMessage>{text}</ErrorMessage>);
    const errorMessage = screen.queryByTestId("errorMessage");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("gc-error-message");
    expect(errorMessage).not.toHaveAttribute("role");
    expect(screen.queryByText(text)).toBeInTheDocument();
  });

  it("supports opt-in live announcements", () => {
    render(<ErrorMessage role="alert">{text}</ErrorMessage>);

    expect(screen.getByRole("alert")).toHaveTextContent(text);
  });
});
