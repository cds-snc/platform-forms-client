import React from "react";
import { render, screen } from "@testing-library/react";

import { Description } from "@components/forms";

describe("Description component", () => {
  const text = "This is a description";
  test("renders without errors", () => {
    render(<Description>{text}</Description>);
    const description = screen.queryByTestId("description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("gc-description");
    expect(screen.queryByText(text)).toBeInTheDocument();
  });
});
