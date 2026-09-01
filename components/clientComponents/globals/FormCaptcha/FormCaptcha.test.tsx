/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HCaptchaExecutionResult } from "@gcforms/hcaptcha/client";
import { FormCaptcha, type FormCaptchaHandle } from "./FormCaptcha";

const { executeCaptcha, resetCaptcha } = vi.hoisted(() => ({
  executeCaptcha: vi.fn<() => Promise<HCaptchaExecutionResult>>(),
  resetCaptcha: vi.fn(),
}));

vi.mock("@gcforms/hcaptcha/client", () => ({
  useHCaptcha: () => ({ captcha: null, execute: executeCaptcha, reset: resetCaptcha }),
}));

describe("FormCaptcha", () => {
  beforeEach(() => {
    executeCaptcha.mockReset();
    executeCaptcha.mockResolvedValue({ verified: true, token: "captcha-token" });
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

  it("does not submit when hCaptcha blocks the request", async () => {
    const onSubmit = vi.fn();
    executeCaptcha.mockResolvedValueOnce({
      verified: false,
      allowed: false,
      reason: "captcha-error",
    });

    render(
      <FormCaptcha onSubmit={onSubmit} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(executeCaptcha).toHaveBeenCalledOnce());
    expect(onSubmit).not.toHaveBeenCalled();
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
