/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { HCaptchaExecutionResult } from "./useHCaptcha";
import { HCaptchaForm, type HCaptchaFormHandle } from "./HCaptchaForm";

const { executeCaptcha, expireCaptcha, resetCaptcha } = vi.hoisted(() => ({
  executeCaptcha: vi.fn<() => Promise<HCaptchaExecutionResult>>(),
  expireCaptcha: vi.fn(),
  resetCaptcha: vi.fn(),
}));

vi.mock("./useHCaptcha", () => ({
  useHCaptcha: ({ onCaptchaExpired }: { onCaptchaExpired?: () => void }) => {
    expireCaptcha.mockImplementation(() => onCaptchaExpired?.());
    return { captcha: null, execute: executeCaptcha, reset: resetCaptcha };
  },
}));

describe("HCaptchaForm", () => {
  beforeEach(() => {
    executeCaptcha.mockReset();
    executeCaptcha.mockResolvedValue({ verified: true, token: "captcha-token" });
    expireCaptcha.mockReset();
    resetCaptcha.mockClear();
  });

  it("passes the verified token through the submit callback", async () => {
    const captchaRef = createRef<HCaptchaFormHandle>();
    const onSubmit = vi.fn();
    const onUnexpectedError = vi.fn();

    render(
      <HCaptchaForm
        ref={captchaRef}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.anything(), "captcha-token"));
    expect(captchaRef.current?.getToken()).toBe("captcha-token");
  });

  it("waits for the async submit callback before allowing another submission", async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn().mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );
    const onUnexpectedError = vi.fn();
    const form = render(
      <HCaptchaForm onSubmit={onSubmit} onUnexpectedError={onUnexpectedError} siteKey="site-key">
        <button type="submit">Submit</button>
      </HCaptchaForm>
    ).container.querySelector("form")!;

    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());

    fireEvent.submit(form);
    expect(executeCaptcha).toHaveBeenCalledOnce();

    await act(async () => {
      resolveSubmit();
    });
    fireEvent.submit(form);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
  });

  it("clears the token and resets the captcha", async () => {
    const captchaRef = createRef<HCaptchaFormHandle>();
    const onSubmit = vi.fn();
    const onUnexpectedError = vi.fn();

    render(
      <HCaptchaForm
        ref={captchaRef}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(captchaRef.current?.getToken()).toBe("captcha-token"));

    captchaRef.current?.reset();

    expect(captchaRef.current?.getToken()).toBeUndefined();
    expect(resetCaptcha).toHaveBeenCalledOnce();
  });

  it("clears the token when captcha expires", async () => {
    const captchaRef = createRef<HCaptchaFormHandle>();
    const onSubmit = vi.fn();
    const onUnexpectedError = vi.fn();

    render(
      <HCaptchaForm
        ref={captchaRef}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(captchaRef.current?.getToken()).toBe("captcha-token"));

    expireCaptcha();

    expect(captchaRef.current?.getToken()).toBeUndefined();
  });

  it("does not submit when hCaptcha blocks the request", async () => {
    const onSubmit = vi.fn();
    const onCaptchaFailure = vi.fn();
    const onUnexpectedError = vi.fn();
    executeCaptcha.mockResolvedValueOnce({
      verified: false,
      allowed: false,
      reason: "captcha-error",
    });

    render(
      <HCaptchaForm
        onCaptchaFailure={onCaptchaFailure}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onCaptchaFailure).toHaveBeenCalledWith("captcha-error"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits without a token when hCaptcha allows the request", async () => {
    const onSubmit = vi.fn();
    const onCaptchaFailure = vi.fn();
    const onUnexpectedError = vi.fn();
    executeCaptcha.mockResolvedValueOnce({
      verified: false,
      allowed: true,
      reason: "captcha-error",
    });

    render(
      <HCaptchaForm
        failureMode="allow"
        onCaptchaFailure={onCaptchaFailure}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.anything()));
    expect(onCaptchaFailure).toHaveBeenCalledWith("captcha-error");
    expect(onSubmit).not.toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it("contains errors thrown by the unexpected-error handler", async () => {
    const executionError = new Error("execution failed");
    const onSubmit = vi.fn();
    const onUnexpectedError = vi.fn(() => {
      throw new Error("error handler failed");
    });
    executeCaptcha.mockRejectedValueOnce(executionError);

    render(
      <HCaptchaForm onSubmit={onSubmit} onUnexpectedError={onUnexpectedError} siteKey="site-key">
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onUnexpectedError).toHaveBeenCalledWith(executionError));
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
    const onUnexpectedError = vi.fn();
    const form = render(
      <HCaptchaForm onSubmit={onSubmit} onUnexpectedError={onUnexpectedError} siteKey="site-key">
        <button type="submit">Submit</button>
      </HCaptchaForm>
    ).container.querySelector("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(executeCaptcha).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();

    resolveCaptcha({ verified: true, token: "captcha-token" });
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });

  it("ignores a stale captcha result after reset and allows a replacement submission", async () => {
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
      )
      .mockResolvedValueOnce({ verified: true, token: "unexpected-token" });
    const captchaRef = createRef<HCaptchaFormHandle>();
    const onSubmit = vi.fn();
    const onUnexpectedError = vi.fn();
    const form = render(
      <HCaptchaForm
        ref={captchaRef}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    ).container.querySelector("form")!;

    fireEvent.submit(form);
    captchaRef.current?.reset();
    fireEvent.submit(form);

    resolveFirstCaptcha({ verified: true, token: "stale-token" });
    await new Promise((resolve) => setTimeout(resolve, 0));

    fireEvent.submit(form);
    expect(executeCaptcha).toHaveBeenCalledTimes(2);

    resolveSecondCaptcha({ verified: true, token: "replacement-token" });
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.anything(), "replacement-token")
    );
  });

  it("bypasses hCaptcha when the app disables it", async () => {
    const onSubmit = vi.fn();
    const onUnexpectedError = vi.fn();

    render(
      <HCaptchaForm
        captchaEnabled={false}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);

    expect(executeCaptcha).not.toHaveBeenCalled();
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
  });

  it("reports synchronous submit errors when the app disables hCaptcha", async () => {
    const submitError = new Error("submit failed");
    const onSubmit = vi.fn(() => {
      throw submitError;
    });
    const onUnexpectedError = vi.fn();

    render(
      <HCaptchaForm
        captchaEnabled={false}
        onSubmit={onSubmit}
        onUnexpectedError={onUnexpectedError}
        siteKey="site-key"
      >
        <button type="submit">Submit</button>
      </HCaptchaForm>
    );

    fireEvent.submit(document.querySelector("form")!);

    await waitFor(() => expect(onUnexpectedError).toHaveBeenCalledWith(submitError));
  });
});
