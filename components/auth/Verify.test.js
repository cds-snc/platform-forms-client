import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Verify } from "./Verify";
import { getCsrfToken, useSession, signIn } from "next-auth/react";

jest.mock("axios");
jest.mock("next-auth/next");
jest.mock("next/router", () => require("next-router-mock"));
jest.mock("next-auth/react");
jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    };
  },
}));

describe("Verify Component", () => {
  it("Should display the 2fa code screen.", async () => {
    getCsrfToken.mockResolvedValue("CsrfToken");
    useSession.mockReturnValue({ data: { user: { id: "1" } }, status: "" });
    const rendered = render(<Verify username="test" authenticationFlowToken="123" />);
    expect(rendered.getByTestId("verify-title")).toBeInTheDocument();
  });

  it("Should display the expired session screen", async () => {
    const signInMock = jest.fn();
    signIn.mockReturnValue({ ok: false, error: "2FAExpiredSession" });
    getCsrfToken.mockResolvedValue("CsrfToken");
    useSession.mockReturnValue({ data: { user: { id: "1" } }, status: "" });
    render(<Verify username="test" authenticationFlowToken="123" />);
    expect(screen.getByTestId("verify-title")).toBeInTheDocument();
    const input = screen.getByTestId("textInput");
    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(screen.getByTestId("verify-submit"));
    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("session-expired")).toBeInTheDocument();
  });
});
