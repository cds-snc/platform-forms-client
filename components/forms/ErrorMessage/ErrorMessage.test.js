import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { ErrorMessage } from "./ErrorMessage";

describe("ErrorMessage component", () => {
  afterAll(cleanup);
  const text = "This is an error";
  it("renders without errors", () => {
    render(<ErrorMessage>{text}</ErrorMessage>);
    const errorMessage = screen.queryByTestId("errorMessage");
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass("gc-error-message");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText(text)).toBeInTheDocument();
  });
});
