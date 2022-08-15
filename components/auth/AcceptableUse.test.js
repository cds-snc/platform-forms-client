import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockedAxios from "axios";
import AcceptableUseTerms from "./AcceptableUse";
import { signOut } from "next-auth/react";

jest.mock("axios");

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(() => ""),
}));

describe("Acceptable use terms", () => {
  it("Renders the acceptable use page.", async () => {
    const props = { userId: "0", content: "test", lastLoginTime: "" };
    await act(async () => {
      render(<AcceptableUseTerms {...props} />);
    });
    expect(screen.getByRole("button", { name: "acceptableUsePage.agree" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "acceptableUsePage.cancel" })).toBeInTheDocument();
  });

  it("Agree on the acceptable use terms", async () => {
    const props = { userId: "1", content: "test", lastLoginTime: "" };

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

  it("Cancel Acceptable use terms", async () => {
    const props = { userId: "2", content: "test", lastLoginTime: "" };
    signOut.I,
      await act(async () => {
        render(<AcceptableUseTerms {...props} />);
      });

    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "acceptableUsePage.cancel" }));
    });

    expect(signOut).toBeCalled();
  });

  it("Renders the acceptable use page.", async () => {
    const props = { userId: "3", content: "test", lastLoginTime: "" };

    await act(async () => {
      render(<AcceptableUseTerms {...props} />);
    });
    expect(screen.getByTestId("richText")).toBeVisible();
  });
});
