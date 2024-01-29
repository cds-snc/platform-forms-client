import React from "react";
import { render, screen } from "@testing-library/react";
import { LoginMenu } from "./LoginMenu";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

const session: Session = {
  expires: (Date.now() + 60 * 60 * 1000).toString(),
  user: {
    id: "1",
    privileges: [],
    acceptableUse: true,
    name: "",
    email: "test@user.ca",
    hasSecurityQuestions: false,
  },
};
const mockUseSession = jest.mocked(useSession, {
  shallow: true,
});

describe("SignIn and SignOut menu Component", () => {
  it("Should display the sigin menu.", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    });

    render(<LoginMenu />);

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("Should display logout button", async () => {
    mockUseSession.mockReturnValue({
      data: session,
      status: "authenticated",
      update: jest.fn(),
    });
    render(<LoginMenu />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
