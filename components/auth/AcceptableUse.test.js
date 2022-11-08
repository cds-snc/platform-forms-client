import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockedAxios from "axios";
import AcceptableUseTerms from "./AcceptableUse";
import { getCsrfToken, useSession } from "next-auth/react";

jest.mock("axios");
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

describe("Acceptable use terms", () => {
  const props = {
    content: "test",
  };
  getCsrfToken.mockResolvedValue("CsrfToken");
  useSession.mockReturnValue({ data: { user: { id: "1" } }, status: "authenticated" });
  it("Renders the acceptable use page.", () => {
    render(<AcceptableUseTerms {...props} />);
    expect(screen.getByRole("button", { name: "acceptableUsePage.agree" })).toBeInTheDocument();
    expect(screen.getByTestId("richText")).toBeVisible();
  });

  it("Agree on the terms of use", async () => {
    const user = userEvent.setup();
    mockedAxios.mockResolvedValue({
      status: 200,
    });

    render(<AcceptableUseTerms {...props} />);
    await user.click(screen.getByRole("button", { name: "acceptableUsePage.agree" }));
    expect(mockedAxios.mock.calls.length).toBe(1);
  });
});
