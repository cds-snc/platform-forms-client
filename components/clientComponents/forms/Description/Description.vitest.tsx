/**
 * @vitest-environment jsdom
 */
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { Description } from "@clientComponents/forms";

describe("Description component", () => {
  const text = "This is a description";
  it("renders without errors", () => {
    render(<Description>{text}</Description>);
    const description = screen.queryByTestId("description");
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass("gc-description");
    expect(screen.queryByText(text)).toBeInTheDocument();
  });
});
