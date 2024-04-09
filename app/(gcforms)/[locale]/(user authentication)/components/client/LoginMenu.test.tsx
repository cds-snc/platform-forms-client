import React from "react";
import { render, screen } from "@testing-library/react";
import { LoginMenu } from "./LoginMenu";

describe("SignIn and SignOut menu Component", () => {
  it("Should display the sigin menu.", async () => {
    render(<LoginMenu />);

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("Should display logout button", async () => {
    render(<LoginMenu />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
