/**
 * @vitest-environment jsdom
 */
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { forwardRef, useEffect, useImperativeHandle } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHCaptcha, type HCaptchaExecutionResult, type HCaptchaLogger } from "./useHCaptcha";

const HCAPTCHA_READINESS_TIMEOUT_MS = 15000;
const HCAPTCHA_EXECUTION_TIMEOUT_MS = 30000;
const HCAPTCHA_CHALLENGE_TIMEOUT_MS = 5 * 60 * 1000;

const mockCaptcha = vi.hoisted(() => ({
  execute: vi.fn<() => void | Promise<{ response: string; key: string }>>(() => undefined),
  isReady: vi.fn(() => true),
  reset: vi.fn(),
  verifyCallbacks: [] as Array<(token: string) => void>,
  closeCallbacks: [] as Array<() => void>,
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
          onOpen,
        }: {
          onError: (code: string) => void;
          onVerify: (token: string) => void;
          onChalExpired: () => void;
          onClose: () => void;
          onReady: () => void;
          onOpen: () => void;
        },
        ref
      ) => {
        useImperativeHandle(ref, () => ({
          resetCaptcha: mockCaptcha.reset,
          execute: mockCaptcha.execute,
          isReady: mockCaptcha.isReady,
        }));
        useEffect(() => {
          mockCaptcha.verifyCallbacks.push(onVerify);
          mockCaptcha.closeCallbacks.push(onClose);
        }, [onVerify, onClose]);

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
            <button key="ready" type="button" data-testid="captcha-ready" onClick={onReady} />,
            <button key="open" type="button" data-testid="captcha-open" onClick={onOpen} />
          );
      }
    );
    MockHCaptcha.displayName = "MockHCaptcha";
    return MockHCaptcha;
  })(),
}));

const HookHarness = ({
  onCaptchaExpired,
  onCaptchaVerified,
  onSuspiciousError,
  onError,
  logger,
  onResult,
}: {
  onCaptchaExpired?: () => void;
  onCaptchaVerified?: () => void;
  onSuspiciousError?: (code: string) => void;
  onError?: (code: string) => void;
  logger?: HCaptchaLogger;
  onResult: (result: HCaptchaExecutionResult) => void;
}) => {
  const { captcha, execute, reset } = useHCaptcha({
    siteKey: "site-key",
    onCaptchaExpired,
    onCaptchaVerified,
    onSuspiciousError,
    onError,
    logger,
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
    mockCaptcha.verifyCallbacks.length = 0;
    mockCaptcha.closeCallbacks.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
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
        reason: "cancelled",
      })
    );
    expect(onError).toHaveBeenCalledWith("challenge-closed");
  });

  it("reports a provider failure once when callback and Promise channels overlap", async () => {
    let rejectProvider: (code: string) => void = () => {};
    mockCaptcha.execute.mockImplementationOnce(
      () => new Promise((_, reject) => (rejectProvider = reject))
    );
    const onResult = vi.fn();
    const onError = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onError={onError} onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-error-network-error"));
    rejectProvider("network-error");

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
        reason: "captcha-error",
      })
    );
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith("network-error");
  });

  it("ignores an asynchronous result from an execution cancelled by reset", async () => {
    let resolveFirst: (result: { response: string; key: string }) => void = () => {};
    let resolveSecond: (result: { response: string; key: string }) => void = () => {};
    mockCaptcha.execute
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          resolveFirst = resolve;
        })
      )
      .mockImplementationOnce(
        () => new Promise((resolve) => {
          resolveSecond = resolve;
        })
      );
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByRole("button", { name: "Reset" }));
    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      resolveFirst({ response: "stale-token", key: "stale-key" });
    });
    expect(onResult).toHaveBeenCalledWith({ verified: false, reason: "cancelled" });
    expect(onResult).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSecond({ response: "current-token", key: "current-key" });
    });
    await waitFor(() =>
      expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "current-token" })
    );
  });

  it("maps an asynchronous challenge expiry to expiration", async () => {
    const onResult = vi.fn();
    const onCaptchaExpired = vi.fn();
    mockCaptcha.execute.mockRejectedValueOnce("challenge-expired");
    const { getByRole } = render(
      <HookHarness onCaptchaExpired={onCaptchaExpired} onResult={onResult} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
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

  it("times out when the provider never becomes ready", async () => {
    vi.useFakeTimers();
    mockCaptcha.isReady.mockReturnValue(false);
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_READINESS_TIMEOUT_MS);
    });

    expect(onResult).toHaveBeenCalledWith({
      verified: false,
      reason: "timeout",
    });
  });

  it("waits until the timeout boundary and logs the timeout", async () => {
    vi.useFakeTimers();
    mockCaptcha.isReady.mockReturnValue(false);
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness logger={logger} onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_READINESS_TIMEOUT_MS - 1);
    });
    expect(onResult).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(onResult).toHaveBeenCalledWith({
      verified: false,
      reason: "timeout",
    });
    expect(logger.warn).toHaveBeenCalledWith(
      `hCaptcha: readiness timed out after ${HCAPTCHA_READINESS_TIMEOUT_MS}ms`
    );
  });

  it("times out when provider execution never settles", async () => {
    vi.useFakeTimers();
    mockCaptcha.execute.mockImplementationOnce(() => new Promise(() => undefined));
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_EXECUTION_TIMEOUT_MS);
    });

    expect(onResult).toHaveBeenCalledWith({
      verified: false,
      reason: "timeout",
    });
  });

  it("gives execution and a delayed visible challenge their own deadlines", async () => {
    vi.useFakeTimers();
    mockCaptcha.isReady.mockReturnValue(false);
    const onResult = vi.fn();
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} logger={logger} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_READINESS_TIMEOUT_MS - 1);
    });
    mockCaptcha.isReady.mockReturnValue(true);
    fireEvent.click(getByTestId("captcha-ready"));
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_EXECUTION_TIMEOUT_MS - 1);
    });
    expect(onResult).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("captcha-ready"));
    expect(mockCaptcha.execute).toHaveBeenCalledOnce();
    fireEvent.click(getByTestId("captcha-open"));
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_CHALLENGE_TIMEOUT_MS - 1);
    });
    expect(onResult).not.toHaveBeenCalled();
    fireEvent.click(getByTestId("captcha-open"));
    fireEvent.click(getByTestId("captcha-ready"));
    expect(mockCaptcha.execute).toHaveBeenCalledOnce();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ verified: false, reason: "timeout" });
    expect(logger.warn).toHaveBeenCalledExactlyOnceWith(
      `hCaptcha: challenge timed out after ${HCAPTCHA_CHALLENGE_TIMEOUT_MS}ms`
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ["verify", { verified: true, token: "captcha-token" }],
    ["close", { verified: false, reason: "cancelled" }],
    ["expired", { verified: false, reason: "expired" }],
  ])("clears the challenge timer on %s", async (event, result) => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} logger={logger} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-open"));
    await act(async () => {
      fireEvent.click(getByTestId(`captcha-${event}`));
    });

    expect(onResult).toHaveBeenCalledExactlyOnceWith(result);
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_CHALLENGE_TIMEOUT_MS);
    });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(onResult).toHaveBeenCalledOnce();
  });

  it("clears the old deadline on reset without timing out a retry", async () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Reset" }));
    });
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ verified: false, reason: "cancelled" });
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_EXECUTION_TIMEOUT_MS - 1);
    });
    expect(onResult).toHaveBeenCalledOnce();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(onResult).toHaveBeenCalledTimes(2);
    expect(onResult).toHaveBeenLastCalledWith({ verified: false, reason: "timeout" });
  });

  it("cancels a pending execution and clears its timer on unmount", async () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    const { getByRole, unmount } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      unmount();
    });

    expect(onResult).toHaveBeenCalledExactlyOnceWith({ verified: false, reason: "cancelled" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores a late provider result after timeout", async () => {
    vi.useFakeTimers();
    let resolveFirst: (result: { response: string; key: string }) => void = () => {};
    let resolveSecond: (result: { response: string; key: string }) => void = () => {};
    mockCaptcha.execute
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecond = resolve;
        })
      );
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_EXECUTION_TIMEOUT_MS);
    });
    fireEvent.click(getByRole("button", { name: "Execute" }));

    resolveFirst({ response: "stale-token", key: "stale-key" });
    await act(async () => {});
    expect(onResult).toHaveBeenCalledTimes(1);

    resolveSecond({ response: "current-token", key: "current-key" });
    await act(async () => {});
    expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "current-token" });
  });

  it("ignores a late verification callback from a timed-out widget during retry", async () => {
    vi.useFakeTimers();
    const onResult = vi.fn();
    const onCaptchaVerified = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness onResult={onResult} onCaptchaVerified={onCaptchaVerified} />
    );
    const oldVerify = mockCaptcha.verifyCallbacks[0];
    const oldClose = mockCaptcha.closeCallbacks[0];

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(HCAPTCHA_EXECUTION_TIMEOUT_MS);
    });
    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      oldVerify("stale-token");
      oldClose();
    });
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ verified: false, reason: "timeout" });
    expect(onCaptchaVerified).not.toHaveBeenCalled();

    fireEvent.click(getByTestId("captcha-verify"));
    await act(async () => {});
    expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" });
  });

  it("ignores a late verification callback from a reset widget during retry", async () => {
    const onResult = vi.fn();
    const onCaptchaVerified = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness onResult={onResult} onCaptchaVerified={onCaptchaVerified} />
    );
    const oldVerify = mockCaptcha.verifyCallbacks[0];

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByRole("button", { name: "Reset" }));
    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      oldVerify("stale-token");
    });
    expect(onResult).toHaveBeenCalledExactlyOnceWith({ verified: false, reason: "cancelled" });
    expect(onCaptchaVerified).not.toHaveBeenCalled();

    fireEvent.click(getByTestId("captcha-verify"));
    await waitFor(() =>
      expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" })
    );
  });

  it("ignores a duplicate verification callback after a successful attempt", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);
    const oldVerify = mockCaptcha.verifyCallbacks[0];

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-verify"));
    await waitFor(() => expect(onResult).toHaveBeenCalledOnce());

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await act(async () => {
      oldVerify("stale-token");
    });
    expect(onResult).toHaveBeenCalledOnce();

    fireEvent.click(getByTestId("captcha-verify"));
    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(2));
    expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" });
  });

  it.each([
    ["close", "cancelled"],
    ["expired", "expired"],
    ["error-network-error", "captcha-error"],
  ])("ignores a late verification callback after %s", async (event, reason) => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(<HookHarness onResult={onResult} />);
    const oldVerify = mockCaptcha.verifyCallbacks[0];

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId(`captcha-${event}`));
    await waitFor(() => expect(onResult).toHaveBeenCalledWith({ verified: false, reason }));
    fireEvent.click(getByRole("button", { name: "Execute" }));

    await act(async () => {
      oldVerify("stale-token");
    });
    expect(onResult).toHaveBeenCalledOnce();

    fireEvent.click(getByTestId("captcha-verify"));
    await waitFor(() =>
      expect(onResult).toHaveBeenLastCalledWith({ verified: true, token: "captcha-token" })
    );
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

  it("logs verification and provider errors", async () => {
    const logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    const onSuspiciousError = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness logger={logger} onSuspiciousError={onSuspiciousError} onResult={vi.fn()} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-verify"));
    fireEvent.click(getByTestId("captcha-error-invalid-data"));
    fireEvent.click(getByTestId("captcha-error-invalid-sitekey"));
    fireEvent.click(getByTestId("captcha-error-network-error"));

    await waitFor(() =>
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("hCaptcha: verified token received")
      )
    );
    expect(logger.warn).toHaveBeenNthCalledWith(
      1,
      'hCaptcha: suspicious error "invalid-data" detected - possible tampering. Submission blocked. Resetting widget state.'
    );
    expect(logger.warn).toHaveBeenNthCalledWith(
      2,
      'hCaptcha: recoverable error "network-error" - user can retry submission'
    );
    expect(logger.error).toHaveBeenCalledWith(
      'hCaptcha: critical configuration error "invalid-sitekey". Submission blocked.'
    );
    expect(onSuspiciousError).toHaveBeenCalledWith("invalid-data");
  });

  it("blocks provider failures in block mode", async () => {
    const onResult = vi.fn();
    const { getByRole, getByTestId } = render(
      <HookHarness onResult={onResult} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-error-network-error"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
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
        reason: "load-error",
      })
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    await waitFor(() => expect(onResult).toHaveBeenCalledTimes(2));
    expect(onResult).toHaveBeenLastCalledWith({
      verified: false,
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
      <HookHarness onCaptchaExpired={onCaptchaExpired} onResult={onResult} />
    );

    fireEvent.click(getByRole("button", { name: "Execute" }));
    fireEvent.click(getByTestId("captcha-expired"));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({
        verified: false,
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
