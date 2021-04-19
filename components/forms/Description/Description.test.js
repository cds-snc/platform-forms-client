import React from "react";
import { render, screen } from "@testing-library/react";

import { Description } from "./Description";

describe("Description component", () => {
  const text = "This is a description";
  test("renders without errors", () => {
    render(<Description>{text}</Description>);
    expect(screen.queryByTestId("description")).toBeInTheDocument().toHaveClass("gc-description");
    expect(screen.queryByText(text)).toBeInTheDocument();
  });
});
