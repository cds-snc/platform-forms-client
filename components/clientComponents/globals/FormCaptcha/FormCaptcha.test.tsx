/**
 * @vitest-environment jsdom
 */
import type { FormHTMLAttributes, ReactNode, SubmitEvent } from "react";
import { createRef, forwardRef, useImperativeHandle } from "react";
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormCaptcha, type FormCaptchaHandle } from "./FormCaptcha";

const { resetCaptcha } = vi.hoisted(() => ({
  resetCaptcha: vi.fn(),
}));

vi.mock("@gcforms/hcaptcha/client", () => ({
  HCaptchaForm: (() => {
    type MockProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
      children: ReactNode;
      onSubmit: (event: SubmitEvent<HTMLFormElement>, token: string) => void;
    };

    const MockHCaptchaForm = forwardRef<{ reset: () => void }, MockProps>(
      ({ children, onSubmit, ...formProps }, ref) => {
        useImperativeHandle(ref, () => ({ reset: resetCaptcha }), []);

        return (
          <form
            {...formProps}
            data-testid="captcha-form"
            onSubmit={(event) =>
              onSubmit(event as unknown as SubmitEvent<HTMLFormElement>, "captcha-token")
            }
          >
            {children}
          </form>
        );
      }
    );

    MockHCaptchaForm.displayName = "MockHCaptchaForm";
    return MockHCaptchaForm;
  })(),
}));

describe("FormCaptcha", () => {
  beforeEach(() => {
    resetCaptcha.mockClear();
  });

  it("forwards the captcha token through the submit callback", () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} captchaEnabled={true} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("[data-testid='captcha-form']")!);

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(captchaRef.current?.getToken()).toBe("captcha-token");
  });

  it("clears the token and resets the captcha", () => {
    const captchaRef = createRef<FormCaptchaHandle>();
    const onSubmit = vi.fn();

    render(
      <FormCaptcha ref={captchaRef} onSubmit={onSubmit} captchaEnabled={true} siteKey="site-key">
        <button type="submit">Submit</button>
      </FormCaptcha>
    );

    fireEvent.submit(document.querySelector("[data-testid='captcha-form']")!);
    captchaRef.current?.reset();

    expect(captchaRef.current?.getToken()).toBeUndefined();
    expect(resetCaptcha).toHaveBeenCalledOnce();
  });
});
