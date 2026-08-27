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
      useImperativeHandle(ref, () => ({ resetCaptcha: mockCaptcha.reset, execute: mockCaptcha.execute }));

      return ["invalid-sitekey", "invalid-data", "network-error"].map((code) => (
        <button key={code} type="button" data-testid={`captcha-error-${code}`} onClick={() => onError(code)} />
      )).concat(
        <button key="verify" type="button" data-testid="captcha-verify" onClick={() => onVerify("captcha-token")} />,
        <button key="expired" type="button" data-testid="captcha-expired" onClick={onChalExpired} />
      );
    });
    MockHCaptcha.displayName = "MockHCaptcha";
    return MockHCaptcha;
  })(),
}));

const HookHarness = ({
  failureMode,
  onCaptchaExpired,
  onConfigError,
  onRecoverableError,
  onResult,
  onSuspiciousError,
  onAnyError,
}: {
  failureMode?: "allow" | "block";
  onCaptchaExpired?: () => void;
  onConfigError?: (code: string) => void;
  onRecoverableError?: (code: string) => void;
  onResult: (result: HCaptchaExecutionResult) => void;
  onSuspiciousError?: (code: string) => void;
  onAnyError?: (code: string) => void;
}) => {
  const { captcha, execute } = useHCaptcha({
    siteKey: "site-key",
    failureMode,
    onCaptchaExpired,
    onConfigError,
    onRecoverableError,
    onSuspiciousError,
    onAnyError,
  });

  return (
    <>
      <button type="button" onClick={async () => onResult(await execute())}>
        Execute
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

  it("allows execution to be retried after a challenge expires", async () => {
    mockCaptcha.execute.mockImplementationOnce(() => undefined);
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-expired"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: true,
        reason: "captcha-error",
      })
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
  fireEvent.click(getByTestId("captcha-verify"));
    await waitFor(() =>
      expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" })
    );
  });

  it("classifies errors and reports them through the catch-all callback", () => {
    const onConfigError = vi.fn();
    const onSuspiciousError = vi.fn();
    const onRecoverableError = vi.fn();
    const onAnyError = vi.fn();
    const { getByTestId } = render(
      <HookHarness
        onResult={vi.fn()}
        onConfigError={onConfigError}
        onSuspiciousError={onSuspiciousError}
        onRecoverableError={onRecoverableError}
        onAnyError={onAnyError}
      />
    );

    fireEvent.click(getByTestId("captcha-error-invalid-sitekey"));
    fireEvent.click(getByTestId("captcha-error-invalid-data"));
    fireEvent.click(getByTestId("captcha-error-network-error"));

    expect(onConfigError).toHaveBeenCalledWith("invalid-sitekey");
    expect(onSuspiciousError).toHaveBeenCalledWith("invalid-data");
    expect(onRecoverableError).toHaveBeenCalledWith("network-error");
    expect(onAnyError).toHaveBeenCalledTimes(3);
  });
});