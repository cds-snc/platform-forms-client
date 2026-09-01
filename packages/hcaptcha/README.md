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
