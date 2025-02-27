# hCAPTCHA

## Setup For local testing
1. Add a nre key HCAPTCHA_SITE_VERIFY_KEY to Github secrets. The value can be found in 1Password. This step is probably done
2. Add a new app setting with name `hCaptchaSiteKey`. The value can be found in 1Password
3. Turn on the hCAPTCHA feature flag
4. Open captcha/helpers.ts and comment out lines 6-9 and 12. This removes an intentionally annoying log and a check that disables hCAPTCHA in the developement environment
5. When you submit a form you should see a hCAPTCHA log message in your browser and a server log message with a score

## Adding hCAPTCHA
For an example of how to add a hCAPTCHA to a form see PR [5165](https://github.com/cds-snc/platform-forms-client/pull/5165)
