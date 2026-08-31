# @gcforms/hcaptcha

Reusable hCaptcha client and server helpers for React applications.

## Installation

Install `@gcforms/hcaptcha` together with its peer dependencies:

```sh
yarn add @gcforms/hcaptcha @hcaptcha/react-hcaptcha react
```

The package provides separate entry points:

- `@gcforms/hcaptcha/client` exports the `useHCaptcha` React hook.
- `@gcforms/hcaptcha/server` exports `verifyHCaptchaToken`.

## Configuration

Create an hCaptcha site key and secret in the hCaptcha dashboard. Make the site key available to the browser and keep the secret server-side:

```sh
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-site-key
HCAPTCHA_SITE_VERIFY_KEY=your-secret
```

## Client Usage

The client hook is headless: render the returned `captcha` component, call `execute()` when the user submits a form, and include the returned token in the request to the server.

This example follows the SSO contact-form pattern with uncontrolled inputs and Next.js `useActionState`:

```tsx
"use client";

import { useActionState, useRef, type FormEvent } from "react";
import { useHCaptcha } from "@gcforms/hcaptcha/client";
import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = { error: undefined };

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { captcha, execute, reset } = useHCaptcha({
    siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "",
    failureMode: "block",
    language: "en",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await execute();
    if (!result.verified) {
      if (!result.allowed) {
        // Display an error or let the user retry, depending on the reason.
        return;
      }

      // In allow mode, the form can continue without a token.
    }

    const formData = new FormData(formRef.current ?? event.currentTarget);
    if (result.verified) formData.set("hCaptchaToken", result.token);
    await formAction(formData);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <label>
        Email
        <input name="email" type="email" required />
      </label>
      <label>
        Message
        <textarea name="message" required />
      </label>
      <button type="submit" disabled={isPending}>
        Send
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      {captcha}
    </form>
  );
}
```

Call `reset()` after a failed submission or when abandoning a pending submission. The hook resolves `execute()` with a structured result:

```ts
{ verified: true, token: "..." }
```

or:

```ts
{
  verified: false,
  allowed: boolean,
  reason:
    | "disabled"
    | "configuration-error"
    | "captcha-error"
    | "expired"
    | "cancelled"
    | "not-ready"
    | "execution-error"
}
```

Use `failureMode: "block"` when a CAPTCHA failure must prevent submission. The default is `"allow"`, which lets the caller continue for failures that are allowed by policy.

## Server Usage

Verify the token in the server action or route that receives the form data. Never trust client-side verification alone, and never expose the verification secret to the browser.

```ts
"use server";

import { verifyHCaptchaToken } from "@gcforms/hcaptcha/server";

export type ContactFormState = {
  error?: string;
};

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const captchaToken = formData.get("hCaptchaToken");
  const captchaResult = await verifyHCaptchaToken(
    typeof captchaToken === "string" ? captchaToken : undefined,
    {
      secret: process.env.HCAPTCHA_SITE_VERIFY_KEY,
      // Supply the request IP when it is available in your framework.
      remoteIp: undefined,
      // Configure this only when your application uses hCaptcha scores.
      maxAllowedScore: 0.79,
    }
  );

  if (!captchaResult.verified) {
    return { error: "CAPTCHA verification failed. Please try again." };
  }

  // Process the contact form only after CAPTCHA verification succeeds.
  return {};
}
```

`verifyHCaptchaToken` returns `{ verified: true, score? }` on success. Failures include `missing-token`, `missing-secret`, `invalid-response`, `score-too-high`, and `api-error`. The helper retries transient network and 5xx failures; callers decide how each failure should affect their workflow.

`maxAllowedScore` is optional and has no default. When configured, a successful response without a score or with a score above the limit is rejected.

## Callbacks and Logging

The client hook accepts:

- `onError(code)`, called for each provider error code.
- `onCaptchaExpired()`, called when an active challenge expires.

The server verifier accepts an optional `logger` with `info` and `warn` methods. Logging is intentionally injected so the package does not depend on an application-specific logger.
