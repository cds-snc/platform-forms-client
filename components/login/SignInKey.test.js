import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockedAxios from "axios";
import SignInKey from "./SignInKey";

jest.mock("axios");

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

describe("Login Component with Sign-In Key", () => {
  it("Renders properly.", async () => {
    await act(async () => {
      render(<SignInKey />);
    });

    expect(screen.getByRole("textbox", { name: "emailLabel" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "signInKeyLabel" })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("Displays an error if the button is pressed with empty fields.", async () => {
    await act(async () => {
      render(<SignInKey />);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("Displays an error if the form is submitted with empty email address.", async () => {
    await act(async () => {
      render(<SignInKey />);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });
    expect(mockedAxios.mock.calls.length).toBe(0);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("Displays an error if the form is submitted with incorrect values.", async () => {
    mockedAxios.mockRejectedValue({
      status: 403,
    });
    await act(async () => {
      render(<SignInKey />);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    const loginEmail = screen.getByTestId("loginEmail");
    await userEvent.type(loginEmail, "test@cds-snc.ca");
    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("Receives a successful call from the server.", async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
    });

    await act(async () => {
      render(<SignInKey />);
    });

    const loginEmail = screen.getByTestId("loginEmail");
    await userEvent.type(loginEmail, "test@cds-snc.ca");
    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });
    expect(mockedAxios.mock.calls.length).toBe(1);
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/token/temporary" })
    );
  });
});
