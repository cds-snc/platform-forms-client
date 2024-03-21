import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AcceptableUseTerms from "./AcceptableUse";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

const mockedUseSession = jest.mocked(useSession);

describe("Acceptable use terms", () => {
  const props = {
    content: "test",
  };

  mockedUseSession.mockReturnValue({
    data: { user: { id: "1" } } as Session,
    status: "authenticated",
    update: jest.fn(),
  });
  it("Renders the acceptable use page.", () => {
    render(<AcceptableUseTerms {...props} />);
    expect(screen.getByRole("button", { name: "acceptableUsePage.agree" })).toBeInTheDocument();
    expect(screen.getByTestId("richText")).toBeVisible();
  });

  it("Agree on the terms of use", async () => {
    const update = jest.fn();
    mockedUseSession.mockReturnValue({
      data: { user: { id: "1" } } as Session,
      status: "authenticated",
      update,
    });
    const user = userEvent.setup();

    render(<AcceptableUseTerms {...props} />);
    expect(screen.getByRole("button", { name: "acceptableUsePage.agree" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "acceptableUsePage.agree" }));
    expect(update.mock.calls.length).toBe(1);
  });
});
