/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, waitFor } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { describe, expect, it, vi } from "vitest";
import { HCaptchaForm, type HCaptchaFormProps } from "./HCaptchaForm";
import { useHCaptcha, type HCaptchaExecutionResult } from "./useHCaptcha";

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: (() => {
    const MockHCaptcha = forwardRef(
    (
      {
        onError,
        onVerify,
      }: {
        onError: (code: string) => void;
        onVerify: (token: string) => void;
      },
      ref
    ) => {
      useImperativeHandle(ref, () => ({
        resetCaptcha: vi.fn(),
        execute: vi.fn(() => onVerify("captcha-token")),
      }));
      return ["invalid-sitekey", "invalid-data", "network-error"].map((code) => (
        <button
          key={code}
          type="button"
          data-testid={`captcha-error-${code}`}
          onClick={() => onError(code)}
        />
      ));
      }
    );
    MockHCaptcha.displayName = "MockHCaptcha";
    return MockHCaptcha;
  })(),
}));

const HookHarness = ({
  failureMode,
  onResult,
}: {
  failureMode?: "allow" | "block";
  onResult: (result: HCaptchaExecutionResult) => void;
}) => {
  const { captcha, execute } = useHCaptcha({ siteKey: "site-key", failureMode });

  return (
    <>
      <button type="button" onClick={async () => onResult(await execute())}>
        Execute
      </button>
      {captcha}
    </>
  );
};

describe("HCaptchaForm error handling", () => {
  it("reports unexpected submit-handler failures", async () => {
    const onUnexpectedError = vi.fn();
    const error = new Error("execution failed");
    const onSubmit = vi.fn(() => {
      throw error;
    });
    const { container } = renderForm({ onSubmit, onUnexpectedError });

    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(onUnexpectedError).toHaveBeenCalledWith(error));
  });

  const renderForm = (props: Partial<HCaptchaFormProps> = {}) =>
    render(
      <HCaptchaForm siteKey="site-key" onSubmit={vi.fn()} {...props}>
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

  it("submits with the token after captcha execution completes", async () => {
    const onSubmit = vi.fn();
    const { container } = renderForm({ onSubmit });

    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit.mock.calls[0]?.[1]).toBe("captcha-token");
  });

  it("returns a structured result from the headless hook", async () => {
    const onResult = vi.fn();
    const { getByRole } = render(<HookHarness onResult={onResult} />);

    fireEvent.click(getByRole("button", { name: "Execute" }));

    await waitFor(() =>
      expect(onResult).toHaveBeenCalledWith({ verified: true, token: "captcha-token" })
    );
  });

  it("reports configuration errors without resetting the token", () => {
    const onConfigError = vi.fn();
    const onCaptchaExpired = vi.fn();
    const { getByTestId } = renderForm({ onConfigError, onCaptchaExpired });

    fireEvent.click(getByTestId("captcha-error-invalid-sitekey"));

    expect(onConfigError).toHaveBeenCalledWith("invalid-sitekey");
    expect(onCaptchaExpired).not.toHaveBeenCalled();
  });

  it("reports suspicious errors and resets the token", () => {
    const onSuspiciousError = vi.fn();
    const onCaptchaExpired = vi.fn();
    const { getByTestId } = renderForm({ onSuspiciousError, onCaptchaExpired });

    fireEvent.click(getByTestId("captcha-error-invalid-data"));

    expect(onSuspiciousError).toHaveBeenCalledWith("invalid-data");
    expect(onCaptchaExpired).toHaveBeenCalledOnce();
  });

  it("reports recoverable errors and resets the token", () => {
    const onRecoverableError = vi.fn();
    const onCaptchaExpired = vi.fn();
    const { getByTestId } = renderForm({ onRecoverableError, onCaptchaExpired });

    fireEvent.click(getByTestId("captcha-error-network-error"));

    expect(onRecoverableError).toHaveBeenCalledWith("network-error");
    expect(onCaptchaExpired).toHaveBeenCalledOnce();
  });

  it("reports every error through the catch-all callback", () => {
    const onAnyError = vi.fn();
    const { getByTestId } = renderForm({ onAnyError });

    fireEvent.click(getByTestId("captcha-error-network-error"));

    expect(onAnyError).toHaveBeenCalledWith("network-error");
  });
});
