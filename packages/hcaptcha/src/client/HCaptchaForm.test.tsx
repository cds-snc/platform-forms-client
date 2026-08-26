/**
 * @vitest-environment jsdom
 */
import { fireEvent, render } from "@testing-library/react";
import { forwardRef, useImperativeHandle } from "react";
import { describe, expect, it, vi } from "vitest";
import { HCaptchaForm, type HCaptchaFormProps } from "./HCaptchaForm";

vi.mock("@hcaptcha/react-hcaptcha", () => ({
  default: forwardRef(({ onError }: { onError: (code: string) => void }, ref) => {
    useImperativeHandle(ref, () => ({ resetCaptcha: vi.fn(), execute: vi.fn() }));
    return ["invalid-sitekey", "invalid-data", "network-error"].map((code) => (
      <button
        key={code}
        type="button"
        data-testid={`captcha-error-${code}`}
        onClick={() => onError(code)}
      />
    ));
  }),
}));

describe("HCaptchaForm error handling", () => {
  const renderForm = (props: Partial<HCaptchaFormProps> = {}) =>
    render(<HCaptchaForm siteKey="site-key" onSubmit={vi.fn()} {...props} />);

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
