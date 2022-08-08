import React from "react";
import { render, screen, act } from "@testing-library/react";
import TemporaryToken from "./TemporaryToken";

jest.mock("axios");

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("Temporary Token Component", () => {
  it("Renders properly.", async () => {
    await act(async () => {
      render(<TemporaryToken />);
    });

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByTestId("submitButton")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
