/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { ErrorListItem } from "@clientComponents/forms";

describe("ErrorListItem component", () => {
  it("renders without errors", async () => {
    render(<ErrorListItem errorKey="1.0" value="Error Message" />);
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Error Message");
  });
});
