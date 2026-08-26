/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHCaptchaErrorHandling } from "./useHCaptchaErrorHandling";

describe("useHCaptchaErrorHandling", () => {
  it("calls onConfigError and sets hasFatalErrorRef for config error codes", () => {
    const onConfigError = vi.fn();
    const resetToken = vi.fn();

    const { result } = renderHook(() => useHCaptchaErrorHandling({ onConfigError, resetToken }));

    act(() => result.current.onErrorCallback("invalid-sitekey"));

    expect(onConfigError).toHaveBeenCalledWith("invalid-sitekey");
    expect(resetToken).not.toHaveBeenCalled();
    expect(result.current.hasFatalErrorRef.current).toBe(true);
  });

  it("calls onSuspiciousError and resets token for suspicious error codes", () => {
    const onSuspiciousError = vi.fn();
    const resetToken = vi.fn();

    const { result } = renderHook(() =>
      useHCaptchaErrorHandling({ onSuspiciousError, resetToken })
    );

    act(() => result.current.onErrorCallback("invalid-data"));

    expect(onSuspiciousError).toHaveBeenCalledWith("invalid-data");
    expect(resetToken).toHaveBeenCalledOnce();
    expect(result.current.hasFatalErrorRef.current).toBe(false);
  });

  it("calls onRecoverableError and resets token for unrecognised error codes", () => {
    const onRecoverableError = vi.fn();
    const resetToken = vi.fn();

    const { result } = renderHook(() =>
      useHCaptchaErrorHandling({ onRecoverableError, resetToken })
    );

    act(() => result.current.onErrorCallback("network-error"));

    expect(onRecoverableError).toHaveBeenCalledWith("network-error");
    expect(resetToken).toHaveBeenCalledOnce();
  });

  it("calls onAnyError as a catch-all regardless of error category", () => {
    const onError = vi.fn();
    const resetToken = vi.fn();

    const { result } = renderHook(() => useHCaptchaErrorHandling({ onError, resetToken }));

    act(() => result.current.onErrorCallback("invalid-sitekey"));
    act(() => result.current.onErrorCallback("invalid-data"));
    act(() => result.current.onErrorCallback("network-error"));

    expect(onError).toHaveBeenCalledTimes(3);
  });

  it("accepts custom configErrorCodes and suspiciousErrorCodes", () => {
    const onConfigError = vi.fn();
    const onSuspiciousError = vi.fn();
    const resetToken = vi.fn();

    const { result } = renderHook(() =>
      useHCaptchaErrorHandling({
        onConfigError,
        onSuspiciousError,
        resetToken,
        configErrorCodes: ["custom-config-error"],
        suspiciousErrorCodes: ["custom-suspicious-error"],
      })
    );

    act(() => result.current.onErrorCallback("custom-config-error"));
    expect(onConfigError).toHaveBeenCalledWith("custom-config-error");

    act(() => result.current.onErrorCallback("custom-suspicious-error"));
    expect(onSuspiciousError).toHaveBeenCalledWith("custom-suspicious-error");
  });
});
