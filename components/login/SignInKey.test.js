import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockedAxios from "axios";
import SignInKey from "./SignInKey";

jest.mock("axios");

describe("Login Component with Sign-In Key", () => {
  it("Renders properly.", async () => {
    render(<SignInKey setParentStage={jest.fn()} />);

    expect(screen.getByRole("textbox", { name: "emailLabel" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "signInKeyLabel" })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("Displays an error if the button is pressed with empty fields.", async () => {
    const user = userEvent.setup();
    render(<SignInKey setParentStage={jest.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("Displays an error if the form is submitted with empty email address.", async () => {
    const user = userEvent.setup();
    render(<SignInKey />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(mockedAxios.mock.calls.length).toBe(0);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("Displays an error if the form is submitted with incorrect values.", async () => {
    const user = userEvent.setup();
    mockedAxios.mockRejectedValue({
      status: 403,
    });

    render(<SignInKey />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const loginEmail = screen.getByTestId("loginEmail");
    await user.type(loginEmail, "test@cds-snc.ca");
    await user.click(screen.getByRole("button"));
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/token/temporary", method: "POST" })
    );
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("Does not display an error after a successful response from the server.", async () => {
    const user = userEvent.setup();
    mockedAxios.mockResolvedValue();

    render(<SignInKey setParentStage={jest.fn()} />);
    const loginEmail = screen.getByTestId("loginEmail");
    await user.type(loginEmail, "test@cds-snc.ca");
    await user.click(screen.getByRole("button"));
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/token/temporary", method: "POST" })
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
