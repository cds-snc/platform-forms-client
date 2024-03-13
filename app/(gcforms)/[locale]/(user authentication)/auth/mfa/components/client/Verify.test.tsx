import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Verify } from "./Verify";
import { useSession, signIn } from "next-auth/react";

jest.mock("axios");
jest.mock("./ReVerify");
jest.mock("@lib/client/clientHelpers");

const mockUseSession = jest.mocked(useSession);
const mockSignIn = jest.mocked(signIn);

const update = jest.fn();

describe("Verify Component", () => {
  it("Should display the 2fa code screen.", async () => {
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update });
    render(<Verify username={{ current: "test" }} authenticationFlowToken={{ current: "123" }} />);
    expect(screen.getByTestId("verify-title")).toBeInTheDocument();
  });

  it("Should display the expired session screen", async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: "2FAExpiredSession", status: 401, url: "" });
    mockUseSession.mockReturnValue({ data: null, status: "unauthenticated", update });
    render(<Verify username={{ current: "test" }} authenticationFlowToken={{ current: "123" }} />);
    expect(screen.getByTestId("verify-title")).toBeInTheDocument();
    const input = screen.getByTestId("textInput");
    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(screen.getByTestId("verify-submit"));
    await waitFor(() => expect(screen.getByTestId("session-expired")).toBeInTheDocument());
  });
});
