import React from "react";
import { render, screen } from "@testing-library/react";
import LoginMenu from "./LoginMenu";
import { useSession } from "next-auth/react";
jest.mock("next-auth/react");

describe("SignIn and SignOut menu Component", () => {
  it("Should display the sigin menu.", async () => {
    useSession.mockReturnValue({ status: "" });
    render(<LoginMenu />);
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("Should display logout button", async () => {
    useSession.mockReturnValue({ data: { user: { id: "1" } }, status: "authenticated" });
    render(<LoginMenu />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
