import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage component", () => {
  afterAll(cleanup);
  const text = "This is an error";
  it("renders without errors", () => {
    render(<ErrorMessage>{text}</ErrorMessage>);
    expect(screen.queryByTestId("errorMessage"))
      .toBeInTheDocument()
      .toHaveClass("gc-error-message");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(text)).toBeInTheDocument();
  });
});
