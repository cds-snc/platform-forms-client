/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, waitFor } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHCaptcha, type HCaptchaExecutionResult } from "./useHCaptcha";

const mockCaptcha = vi.hoisted(() => ({
  execute: vi.fn<() => void | Promise<{ response: string; key: string }>>(() => undefined),
  isReady: vi.fn(() => true),
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
          onClose,
          onReady,
        }: {
          onError: (code: string) => void;
          onVerify: (token: string) => void;
          onChalExpired: () => void;
          onClose: () => void;
          onReady: () => void;
        },
        ref
      ) => {
        useImperativeHandle(ref, () => ({
          resetCaptcha: mockCaptcha.reset,
          execute: mockCaptcha.execute,
          isReady: mockCaptcha.isReady,
        }));

        // Use buttons to simulate provider callbacks without loading the real hCaptcha widget
        return ["invalid-sitekey", "invalid-data", "network-error", "script-error"]
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
            />,
            <button key="close" type="button" data-testid="captcha-close" onClick={onClose} />,
            <button key="ready" type="button" data-testid="captcha-ready" onClick={onReady} />
          );
      }
    );
    MockHCaptcha.displayName = "MockHCaptcha";
    return MockHCaptcha;
  })(),
}));

const HookHarness = ({
  failureMode,
  onCaptchaExpired,
  onCaptchaVerified,
  onError,
  onResult,
}: {
  failureMode?: "allow" | "block";
  onCaptchaExpired?: () => void;
  onCaptchaVerified?: () => void;
  onError?: (code: string) => void;
  onResult: (result: HCaptchaExecutionResult) => void;
}) => {
  const { captcha, execute, reset } = useHCaptcha({
    siteKey: "site-key",
    failureMode,
    onCaptchaExpired,
    onCaptchaVerified,
    onError,
  });

  return (
    <>
      {/* Await execute so tests observe the result produced by a simulated provider callback */}
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
    mockCaptcha.isReady.mockReset();
    mockCaptcha.isReady.mockReturnValue(true);
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

  it("uses the token returned by asynchronous provider execution", async () => {
    mockCaptcha.execute.mockResolvedValueOnce({ response: "async-token", key: "response-key" });
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith({ verified: true, token: "async-token" }));
  });

  it("returns an execution failure when asynchronous provider execution rejects", async () => {
    mockCaptcha.execute.mockRejectedValueOnce(new Error("provider failed"));
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "execution-error",
      })
    );
  });

  it("maps an asynchronous challenge close to cancellation and reports the provider code", async () => {
    const onResult = vi.fn();
    const onError = vi.fn();
    mockCaptcha.execute.mockRejectedValueOnce("challenge-closed");
    const { getByRole } = render(<HookHarness onError={onError} onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "cancelled",
      })
    );
    expect(onError).toHaveBeenCalledWith("challenge-closed");
  });

  it("maps an asynchronous challenge expiry to expiration", async () => {
    const onResult = vi.fn();
    const onCaptchaExpired = vi.fn();
    mockCaptcha.execute.mockRejectedValueOnce("challenge-expired");
    const { getByRole } = render(
      <HookHarness failureMode="allow" onCaptchaExpired={onCaptchaExpired} onResult={onResult} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: true,
        reason: "expired",
      })
    );
    expect(onCaptchaExpired).toHaveBeenCalledOnce();
  });

  it("waits for the provider to be ready before executing", async () => {
    mockCaptcha.isReady.mockReturnValue(false);
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    expect(mockCaptcha.execute).not.toHaveBeenCalled();

    mockCaptcha.isReady.mockReturnValue(true);
    fireEvent.click(getByTestId("captcha-ready"));

    await waitFor(() => expect(mockCaptcha.execute).toHaveBeenCalledOnce());
  });

  it("reports the verified token through the callback", async () => {
    const onCaptchaVerified = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness onCaptchaVerified={onCaptchaVerified} onResult={vi.fn()} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-verify"));

    await waitFor(() => expect(onCaptchaVerified).toHaveBeenCalledOnce());
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
        allowed: false,
        reason: "execution-error",
      })
    );
  });

  it("fails fast after the hCaptcha script fails to load", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-error-script-error"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "load-error",
      })
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(2));
    expect(onResult).toHaveBeenLastCalledWith({
      verified: false,
      allowed: false,
      reason: "load-error",
    });
  });

  it("keeps configuration failures distinct from script load failures", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByTestId("captcha-error-invalid-sitekey"));
    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "configuration-error",
      })
    );
    expect(mockCaptcha.execute).not.toHaveBeenCalled();
  });

  it("allows a new execution after resetting a script load failure", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-error-script-error"));
    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith(expect.objectContaining({ reason: "load-error" }))
    );

    fireEvent.click(getByRole("button", { name: "Reset" }));
    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-verify"));

    await waitFor(() =>
      expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" })
    );
  });

  it("allows execution to be retried after a challenge expires", async () => {
    mockCaptcha.execute.mockImplementationOnce(() => undefined);
    const onResult = vi.fn();
    const onCaptchaExpired = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness failureMode="allow" onCaptchaExpired={onCaptchaExpired} onResult={onResult} />
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

  it("cancels an execution when the challenge is closed", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-close"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        allowed: false,
        reason: "cancelled",
      })
    );
    expect(mockCaptcha.reset).toHaveBeenCalledOnce();
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
