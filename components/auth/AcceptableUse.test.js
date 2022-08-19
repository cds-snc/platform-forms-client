import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockedAxios from "axios";
import AcceptableUseTerms from "./AcceptableUse";
import { signOut } from "next-auth/react";
import { getCsrfToken } from "next-auth/react";

jest.mock("axios");
jest.mock("next-auth/react");

describe("Acceptable use terms", () => {
  const props = { userId: "1", content: "test", lastLoginTime: "2022-17-08", formID: "testid" };
  getCsrfToken.mockReturnValue("CsrfToken");

  it("Renders the acceptable use page.", async () => {
    await act(async () => {
      render(<AcceptableUseTerms {...props} />);
    });
    expect(screen.getByRole("button", { name: "acceptableUsePage.agree" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "acceptableUsePage.cancel" })).toBeInTheDocument();
    expect(screen.getByTestId("richText")).toBeVisible();
  });

  it("Agree on the terms of use", async () => {
    mockedAxios.mockRejectedValue({
      status: 200,
    });

    await act(async () => {
      render(<AcceptableUseTerms {...props} />);
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "acceptableUsePage.agree" }));
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
  });

  it("Should cancel acceptable use terms", async () => {
    await act(async () => {
      render(<AcceptableUseTerms {...props} />);
    });

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "acceptableUsePage.cancel" }));
    });

    expect(signOut).toBeCalled();
  });
});
