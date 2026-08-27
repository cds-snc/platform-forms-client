/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormCaptcha, type FormCaptchaHandle } from "./FormCaptcha";

const { executeCaptcha, resetCaptcha } = vi.hoisted(() => ({
  executeCaptcha: vi.fn(async () => ({ verified: true as const, token: "captcha-token" })),
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
});
