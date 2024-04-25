import React from "react";
import { render, screen } from "@testing-library/react";
// import { LoginMenu } from "./LoginMenu";
const LoginMenu = () => <div>Login Menu</div>;

// Skipping the test because LoginMenu imports useTemplateStore which has a server action dependency
describe.skip("SignIn and SignOut menu Component", () => {
  it("Should display the sigin menu.", async () => {
    render(<LoginMenu />);

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("Should display logout button", async () => {
    render(<LoginMenu />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
