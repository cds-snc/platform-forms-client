/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, waitFor } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHCaptcha, type HCaptchaExecutionResult } from "./useHCaptcha";

const mockCaptcha = vi.hoisted(() => ({
  execute: vi.fn(() => undefined),
  reset: vi.fn(),
}));

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: (() => {
    const MockHCaptcha = forwardRef(
      (
        {
          onError,
          onVerify,
          onChalExpired,
        }: {
          onError: (code: string) => void;
          onVerify: (token: string) => void;
          onChalExpired: () => void;
        },
        ref
      ) => {
        useImperativeHandle(ref, () => ({
          resetCaptcha: mockCaptcha.reset,
          execute: mockCaptcha.execute,
        }));

        return ["invalid-sitekey", "invalid-data", "network-error"]
          .map((code) => (
            <button
              key={code}
              type="button"
              data-testid={`captcha-error-${code}`}
              onClick={() => onError(code)}
            />
          ))
          .concat(
            <button
              key="verify"
              type="button"
              data-testid="captcha-verify"
              onClick={() => onVerify("captcha-token")}
            />,
            <button
              key="expired"
              type="button"
              data-testid="captcha-expired"
              onClick={onChalExpired}
            />
          );
      }
    );
    MockHCaptcha.displayName = "MockHCaptcha";
    return MockHCaptcha;
  })(),
}));

const HookHarness = ({
  captchaEnabled,
  failureMode,
  onCaptchaExpired,
  onError,
  onResult,
}: {
  captchaEnabled?: boolean;
  failureMode?: "allow" | "block";
  onCaptchaExpired?: () => void;
  onError?: (code: string) => void;
  onResult: (result: HCaptchaExecutionResult) => void;
}) => {
  const { captcha, execute, reset } = useHCaptcha({
    captchaEnabled,
    siteKey: "site-key",
    failureMode,
    onCaptchaExpired,
    onError,
  });

  return (
    <>
      <button type="button" onClick={async () => onResult(await execute())}>
        Execute
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
      {captcha}
    </>
  );
};

describe("useHCaptcha", () => {
  beforeEach(() => {
    mockCaptcha.execute.mockReset();
    mockCaptcha.execute.mockImplementation(() => undefined);
    mockCaptcha.reset.mockClear();
  });

  it("returns the verified token", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-verify"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({ verified: true, token: "captcha-token" })
    );
  });

  it("allows a disabled captcha", async () => {
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness captchaEnabled={false} onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: true,
        reason: "disabled",
      })
    );
  });

  it("blocks provider failures in block mode", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness failureMode="block" onResult={onResult} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-error-network-error"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "captcha-error",
      })
    );
  });

  it("returns an execution failure when the provider throws", async () => {
    const error = new Error("execution failed");
    mockCaptcha.execute.mockImplementationOnce(() => {
      throw error;
    });
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: true,
        reason: "execution-error",
      })
    );
  });

  it("allows execution to be retried after a challenge expires", async () => {
    mockCaptcha.execute.mockImplementationOnce(() => undefined);
    const onResult = vi.fn();
    const onCaptchaExpired = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness onCaptchaExpired={onCaptchaExpired} onResult={onResult} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-expired"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: true,
        reason: "expired",
      })
    );
    expect(onCaptchaExpired).toHaveBeenCalledOnce();

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-verify"));
    await waitFor(() =>
      expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" })
    );
  });

  it("cancels a pending execution without reporting expiration", async () => {
    const onResult = vi.fn();
    const onCaptchaExpired = vi.fn();
    const { getByRole } = render(
      <HookHarness onResult={onResult} onCaptchaExpired={onCaptchaExpired} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByRole("button", { name: "Reset" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "cancelled",
      })
    );
    expect(onCaptchaExpired).not.toHaveBeenCalled();
  });

  it("classifies errors and reports them through the catch-all callback", () => {
    const onError = vi.fn();
    const { getByTestId } = render(<HookHarness onResult={vi.fn()} onError={onError} />);

    fireEvent.click(getByTestId("captcha-error-invalid-sitekey"));
    fireEvent.click(getByTestId("captcha-error-invalid-data"));
    fireEvent.click(getByTestId("captcha-error-network-error"));

    expect(onError.mock.calls).toEqual([["invalid-sitekey"], ["invalid-data"], ["network-error"]]);
  });
});
