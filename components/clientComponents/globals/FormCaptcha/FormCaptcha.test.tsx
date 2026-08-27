/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HCaptchaExecutionResult } from "@gcforms/hcaptcha/client";
import { FormCaptcha, type FormCaptchaHandle } from "./FormCaptcha";

const { executeCaptcha, resetCaptcha } = vi.hoisted(() => ({
  executeCaptcha: vi.fn<() => Promise<HCaptchaExecutionResult>>(async () => ({
    verified: true,
    token: "captcha-token",
  })),
  resetCaptcha: vi.fn(),
}));

vi.mock("@gcforms/hcaptcha/client", () => ({
  useHCaptcha: () => ({ captcha: null, execute: executeCaptcha, reset: resetCaptcha }),
}));

describe("FormCaptcha", () => {
  beforeEach(() => {
    executeCaptcha.mockClear();
    resetCaptcha.mockClear();
  });

  it("reports unexpected execution failures", async () => {
    const error = new Error("execution failed");
    executeCaptcha.mockRejectedValueOnce(error);
    const onUnexpectedError = vi.fn();

    render(
      <FormCaptcha
        onUnexpectedError={onUnexpectedError}
        onSubmit={vi.fn()}
        captchaEnabled={true}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onUnexpectedError).toHaveBeenCalledWith(error));
  });

  it("reports unexpected submit-handler failures", async () => {
    const error = new Error("submit failed");
    const onUnexpectedError = vi.fn();
    const onSubmit = vi.fn(() => {
      throw error;
    });

    render(
      <FormCaptcha
        onUnexpectedError={onUnexpectedError}
        onSubmit={onSubmit}
        captchaEnabled={true}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onUnexpectedError).toHaveBeenCalledWith(error));
  });

  it("does not rethrow when the unexpected-error handler fails", async () => {
    const error = new Error("submit failed");
    const handlerError = new Error("error handler failed");
    const onUnexpectedError = vi.fn(() => {
      throw handlerError;
    });
    const onSubmit = vi.fn(() => {
      throw error;
    });

    render(
      <FormCaptcha
        onUnexpectedError={onUnexpectedError}
        onSubmit={onSubmit}
        captchaEnabled={true}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onUnexpectedError).toHaveBeenCalledWith(error));
  });

  it("forwards the captcha token through the submit callback", async () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} captchaEnabled={true} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(captchaRef.current?.getToken()).toBe("captcha-token");
  });

  it("clears the token and resets the captcha", async () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} captchaEnabled={true} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(captchaRef.current?.getToken()).toBe("captcha-token"));
    captchaRef.current?.reset();

    expect(captchaRef.current?.getToken()).toBeUndefined();
    expect(resetCaptcha).toHaveBeenCalledOnce();
  });

  it("clears a previous token before an allowed failure", async () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();
    executeCaptcha
      .mockResolvedValueOnce({ verified: true as const, token: "captcha-token" })
      .mockResolvedValueOnce({ verified: false as const, allowed: true, reason: "captcha-error" });

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} captchaEnabled={true} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(captchaRef.current?.getToken()).toBe("captcha-token"));

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));

    expect(captchaRef.current?.getToken()).toBeUndefined();
  });
});
