import React from "react";
import { render, screen } from "@testing-library/react";
import { Verify } from "./Verify";
import { getCsrfToken, useSession } from "next-auth/react";
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
});
