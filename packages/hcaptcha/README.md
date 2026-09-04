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
discard any stored token when `onCaptchaExpired` runs or when `reset()` is called. Calling `reset()`
also recreates the widget, allowing consumers to retry after a provider load failure.

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

Pass `logger` to record hCaptcha lifecycle messages. `onSuspiciousError` is called for provider
errors that indicate a potentially tampered request, allowing the consumer to block or replace
the surrounding UI without implementing hCaptcha error classification itself.

## Form wrapper

`HCaptchaForm` combines the hook with a native `<form>`. It prevents duplicate submissions,
passes the verified token to `onSubmit`, and exposes `getToken()` and `reset()` through its ref.
Consumers provide `onUnexpectedError` to handle errors from their submit callback. Use the hook
directly when the consumer needs more control over the form or submission lifecycle.

## Server verification

`verifyHCaptchaToken` rejects missing credentials, invalid provider responses, and scores above
`maxAllowedScore`. When `maxAllowedScore` is configured, a successful response without a score is
also rejected. Scores are an hCaptcha Enterprise-only response field, so configure a score limit
only with an Enterprise sitekey; leave the option unset for standard sitekeys.

Pass the public `siteKey` to bind verification to the expected hCaptcha sitekey.
The browser needs this key to issue a token, but the server can verify a token with just the token
and secret. Passing `siteKey` adds an extra check that the token belongs to the expected site and is
useful when a secret is shared by more than one sitekey. It is public and should not be confused
with the server-only `secret`. Network and 5xx failures are retried up to `maxAttempts` times,
defaulting to three attempts.
