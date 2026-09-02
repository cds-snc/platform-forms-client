/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HCaptchaExecutionResult } from "@gcforms/hcaptcha/client";
import { FormCaptcha, type FormCaptchaHandle } from "./FormCaptcha";

const { executeCaptcha, expireCaptcha, logInfo, resetCaptcha } = vi.hoisted(() => ({
  executeCaptcha: vi.fn<() => Promise<HCaptchaExecutionResult>>(),
  expireCaptcha: vi.fn(),
  logInfo: vi.fn(),
  resetCaptcha: vi.fn(),
}));

vi.mock("@gcforms/hcaptcha/client", () => ({
  useHCaptcha: ({ onCaptchaExpired }: { onCaptchaExpired?: () => void }) => {
    expireCaptcha.mockImplementation(() => onCaptchaExpired?.());
    return { captcha: null, execute: executeCaptcha, reset: resetCaptcha };
  },
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    info: logInfo,
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FormCaptcha", () => {
  beforeEach(() => {
    executeCaptcha.mockReset();
    executeCaptcha.mockResolvedValue({ verified: true, token: "captcha-token" });
    expireCaptcha.mockReset();
    logInfo.mockReset();
    resetCaptcha.mockClear();
  });

  it("forwards the verified token through the submit callback", async () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(captchaRef.current?.getToken()).toBe("captcha-token");
    expect(logInfo).toHaveBeenCalledWith(
      expect.stringMatching(/^hCaptcha: verified token received by form at .+$/)
    );
  });

  it("clears the token and resets the captcha", async () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(captchaRef.current?.getToken()).toBe("captcha-token"));

    captchaRef.current?.reset();

    expect(captchaRef.current?.getToken()).toBeUndefined();
    expect(resetCaptcha).toHaveBeenCalledOnce();
  });

  it("clears the token when captcha expires", async () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(captchaRef.current?.getToken()).toBe("captcha-token"));

    expireCaptcha();

    expect(captchaRef.current?.getToken()).toBeUndefined();
  });

  it("does not submit when hCaptcha blocks the request", async () => {
    const onSubmit = vi.fn();
    const onCaptchaFailure = vi.fn();
    executeCaptcha.mockResolvedValueOnce({
      verified: false,
      allowed: false,
      reason: "captcha-error",
    });

    render(
      <FormCaptcha onCaptchaFailure={onCaptchaFailure} onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onCaptchaFailure).toHaveBeenCalledWith("captcha-error"));
    expect(executeCaptcha).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ignores a second submit while hCaptcha is pending", async () => {
    let resolveCaptcha: (result: HCaptchaExecutionResult) => void = () => {};
    executeCaptcha.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveCaptcha = resolve;
      })
    );
    const onSubmit = vi.fn();
    const form = render(
      <FormCaptcha onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    ).container.querySelector("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(executeCaptcha).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();

    resolveCaptcha({ verified: true, token: "captcha-token" });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });

  it("ignores an in-flight captcha result after reset", async () => {
    // Keep both executions pending so reset and the replacement submission can be ordered explicitly.
    let resolveFirstCaptcha: (result: HCaptchaExecutionResult) => void = () => {};
    let resolveSecondCaptcha: (result: HCaptchaExecutionResult) => void = () => {};
    executeCaptcha
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirstCaptcha = resolve;
        })
      )
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveSecondCaptcha = resolve;
        })
      );
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();
    const form = render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    ).container.querySelector("form")!;

    fireEvent.submit(form);
    captchaRef.current?.reset();
    // Reset invalidates the first execution and permits a new submission to begin.
    fireEvent.submit(form);

    // The old result must not submit or replace the token from the new execution.
    resolveFirstCaptcha({ verified: true, token: "old-token" });
    await Promise.resolve();
    await Promise.resolve();

    expect(onSubmit).not.toHaveBeenCalled();
    expect(captchaRef.current?.getToken()).toBeUndefined();
    // The stale finally handler must not clear the replacement execution's pending state.
    fireEvent.submit(form);
    expect(executeCaptcha).toHaveBeenCalledTimes(2);

    // Only the current execution may submit the form.
    resolveSecondCaptcha({ verified: true, token: "new-token" });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(captchaRef.current?.getToken()).toBe("new-token");
  });

  it("bypasses hCaptcha when the app disables it", () => {
    const onSubmit = vi.fn();

    render(
      <FormCaptcha captchaEnabled={false} onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    expect(executeCaptcha).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
