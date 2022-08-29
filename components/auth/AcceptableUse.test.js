import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockedAxios from "axios";
import AcceptableUseTerms from "./AcceptableUse";
import { signOut } from "next-auth/react";
import { getCsrfToken } from "next-auth/react";

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
    userId: "1",
    content: "test",
    lastLoginTime: new Date("2022-08-24"),
    formID: "testid",
  };
  getCsrfToken.mockResolvedValue("CsrfToken");

  it("Renders the acceptable use page.", async () => {
    render(<AcceptableUseTerms {...props} />);
    expect(screen.getByRole("button", { name: "acceptableUsePage.agree" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "acceptableUsePage.cancel" })).toBeInTheDocument();
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

  it("Should cancel acceptable use terms", async () => {
    const user = userEvent.setup();
    render(<AcceptableUseTerms {...props} />);
    await user.click(screen.getByRole("button", { name: "acceptableUsePage.cancel" }));

    expect(signOut).toBeCalled();
  });
});
