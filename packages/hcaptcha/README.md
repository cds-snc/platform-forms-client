# @gcforms/hcaptcha

Reusable hCaptcha client and server helpers for React applications.

## Installation

Install `@gcforms/hcaptcha` together with its peer dependencies:

```sh
yarn add @gcforms/hcaptcha @hcaptcha/react-hcaptcha react
```

The package provides separate entry points:

- `@gcforms/hcaptcha/client` exports the `useHCaptcha` React hook
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

## Server verification

`verifyHCaptchaToken` rejects missing credentials, invalid provider responses, and scores above
`maxAllowedScore`. Network and 5xx failures are retried up to `maxAttempts` times, defaulting to
three attempts.
