import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorListItem from "./ErrorListItem";

describe("ErrorListItem component", () => {
  it("renders without errors", async () => {
    render(<ErrorListItem errorKey="1.0" value="Error Message" />);
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Error Message");
  });
});
