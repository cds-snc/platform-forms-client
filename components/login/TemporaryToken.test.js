import React from "react";
import { render, screen } from "@testing-library/react";
import TemporaryToken from "./TemporaryToken";

jest.mock("axios");

describe("Temporary Token Component", () => {
  it("Renders properly.", () => {
    render(<TemporaryToken />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByTestId("submitButton")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
