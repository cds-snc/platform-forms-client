import React from "react";
import { Confirmation } from "./Confirmation";
import { useAuth } from "../../../lib/hooks";
import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("../../../lib/hooks");

describe("confirmation component", () => {
  let confirmMock;
  let resendConfirmationMock;
  beforeEach(() => {
    confirmMock = jest.fn(async () => {});
    resendConfirmationMock = jest.fn(async () => {});
    useAuth.mockImplementation(() => ({
      confirm: confirmMock,
      resendConfirmationCode: resendConfirmationMock,
    }));
  });
  afterEach(() => {
    useAuth.mockReset();
    confirmMock.mockReset();
    resendConfirmationMock.mockReset();
    cleanup();
  });
  test("title form and buttons are rendered correctly", () => {
    render(<Confirmation username={"test"} language={"en"} t={(key) => key} />);
    expect(screen.getByRole("heading")).toHaveTextContent("signUpConfirmation.title");
    expect(screen.getByRole("textbox")).toHaveAttribute("name", "confirmationCode");
    expect(screen.getAllByRole("button")[1]).toHaveTextContent(
      "signUpConfirmation.resendConfirmationCodeButton"
    );
    expect(screen.getAllByRole("button")[0]).toHaveTextContent("signUpConfirmation.confirmButton");
  });

  test("when the resend confirmation button is clicked the confirmation code is resent", async () => {
    const user = userEvent.setup();
    render(<Confirmation username={"test"} language={"en"} t={(key) => key} />);
    await user.click(screen.getByText("signUpConfirmation.resendConfirmationCodeButton"));
    expect(resendConfirmationMock.mock.calls.length).toBe(1);
    expect(resendConfirmationMock.mock.calls[0][0]).toBe("test");
  });

  test("when form is submitted, the user is confirmed", async () => {
    const user = userEvent.setup();
    const confirmationCallback = jest.fn();
    const confirmationAuthenticationFailedCallback = jest.fn();
    render(
      <Confirmation
        username={"test"}
        password={"test"}
        language={"en"}
        t={(key) => key}
        confirmationCallback={confirmationCallback}
        confirmationAuthenticationFailedCallback={confirmationAuthenticationFailedCallback}
      />
    );
    await act(async () => {
      await user.type(screen.getByRole("textbox"), "7876657");
      await user.click(screen.getByText("signUpConfirmation.confirmButton"));
    });
    expect(confirmMock.mock.calls.length).toBe(1);
    expect(confirmMock.mock.calls[0][0]).toEqual({
      username: "test",
      password: "test",
      confirmationCode: "7876657",
      shouldSignIn: true,
      confirmationCallback,
      confirmationAuthenticationFailedCallback,
    });
  });
});
