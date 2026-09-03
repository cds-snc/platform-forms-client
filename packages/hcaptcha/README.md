# @gcforms/hcaptcha

Reusable hCaptcha client and server helpers for React applications.

## Installation

Install `@gcforms/hcaptcha` together with its peer dependencies:

```sh
yarn add @gcforms/hcaptcha @hcaptcha/react-hcaptcha react
```

The package provides separate entry points:

- `@gcforms/hcaptcha/client` exports the `useHCaptcha` React hook
- `@gcforms/hcaptcha/client` exports the `HCaptchaForm` native form wrapper
- `@gcforms/hcaptcha/server` exports the `verifyHCaptchaToken` library

## Client lifecycle

The hook does not store the token. Consumers should submit a verified token immediately and
discard any stored token when `onCaptchaExpired` runs or when `reset()` is called.

`execute()` resolves with a result rather than throwing for normal provider failures:

```tsx
const { captcha, execute, reset } = useHCaptcha({ siteKey, failureMode: "block" });

const result = await execute();
if (result.verified) {
	await submit(result.token);
}

// Render `captcha` with the form and call `reset()` when abandoning the submission.
```

`failureMode` defaults to `"block"`. Set it to `"allow"` only when the consumer intentionally
wants provider failures to permit the surrounding action to continue.

## Form wrapper

`HCaptchaForm` combines the hook with a native `<form>`. It prevents duplicate submissions,
passes the verified token to `onSubmit`, and exposes `getToken()` and `reset()` through its ref.
Consumers provide `onUnexpectedError` to handle errors from their submit callback. Use the hook
directly when the consumer needs more control over the form or submission lifecycle.

## Server verification

`verifyHCaptchaToken` rejects missing credentials, invalid provider responses, and scores above
`maxAllowedScore`. Network and 5xx failures are retried up to `maxAttempts` times, defaulting to
three attempts.
