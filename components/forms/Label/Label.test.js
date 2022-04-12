import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Label } from "./Label";

describe("Label component", () => {
  afterEach(cleanup);
  const text = "This is a label";
  it("renders without errors", () => {
    render(<Label htmlFor="testInput">{text}</Label>);
    const label = screen.queryByTestId("label");
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute("for", "testInput");
    expect(screen.queryByText(text)).toBeInTheDocument();
  });
});
