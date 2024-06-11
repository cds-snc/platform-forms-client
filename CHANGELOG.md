# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.13.0](https://github.com/cds-snc/platform-forms-client/compare/v3.12.11...v3.13.0) (2024-06-11)


### Features

* Implement NextJS App Router ([d067648](https://github.com/cds-snc/platform-forms-client/commit/d067648ba22d8bb0516434ecf2e97dc2d9d2762c))
* implement temporary hack to handle Submission lambda name change ([#3486](https://github.com/cds-snc/platform-forms-client/issues/3486)) ([48919e3](https://github.com/cds-snc/platform-forms-client/commit/48919e38b00c4ce591009f7dd076e3f8b4bbf5c3))


### Bug Fixes

* auth error handling noise ([#3666](https://github.com/cds-snc/platform-forms-client/issues/3666)) ([0798684](https://github.com/cds-snc/platform-forms-client/commit/0798684ee89db0d42008c7eb639f49cc83cb5c7d))
* Checkbox / Radio styling in form builder  ([#3593](https://github.com/cds-snc/platform-forms-client/issues/3593)) ([d8244ec](https://github.com/cds-snc/platform-forms-client/commit/d8244ec8f9b297c98fb71eeda0674d366eca2cb7))
* create only one instance of DynamoDBDocumentClient ([#3565](https://github.com/cds-snc/platform-forms-client/issues/3565)) ([9b1446c](https://github.com/cds-snc/platform-forms-client/commit/9b1446cef14119bfd155a5b96a74546d058e2cfa))
* Enforce max entries when signing off responses ([#3589](https://github.com/cds-snc/platform-forms-client/issues/3589)) ([a7b382b](https://github.com/cds-snc/platform-forms-client/commit/a7b382bed6a15f99240ecc24f20cffe15d84ebb3))
* Ensure trusted host also uses nextauth_url ([#3772](https://github.com/cds-snc/platform-forms-client/issues/3772)) ([742c233](https://github.com/cds-snc/platform-forms-client/commit/742c23339e35643cdcee376ebbce9e02080a3028))
* logic view group node outline styling ([#3773](https://github.com/cds-snc/platform-forms-client/issues/3773)) ([9363fd3](https://github.com/cds-snc/platform-forms-client/commit/9363fd3154684d558cf9b1f51c97b627eacfe584))
* Only show Translate Navigation when groups off ([#3713](https://github.com/cds-snc/platform-forms-client/issues/3713)) ([8f1c5e5](https://github.com/cds-snc/platform-forms-client/commit/8f1c5e58a708fda19470ecb50d64ae0ce4b9f6dc))
* Revert "chore(deps): pin dependencies ([#3230](https://github.com/cds-snc/platform-forms-client/issues/3230))" ([#3537](https://github.com/cds-snc/platform-forms-client/issues/3537)) ([589b879](https://github.com/cds-snc/platform-forms-client/commit/589b879c7a4b4dbec8460238b3b3a7af09a7c301))
* server action error handling ([#3659](https://github.com/cds-snc/platform-forms-client/issues/3659)) ([0d5295a](https://github.com/cds-snc/platform-forms-client/commit/0d5295af9f81e87c719d309b38d5eb09120a526a))
* Session expiry set to 2 hours ([#3578](https://github.com/cds-snc/platform-forms-client/issues/3578)) ([ef93921](https://github.com/cds-snc/platform-forms-client/commit/ef9392187955cfae5311d55fffda4841b558c3f5))
* Treeview Drag/Drop fixes ([#3722](https://github.com/cds-snc/platform-forms-client/issues/3722)) ([fed32fe](https://github.com/cds-snc/platform-forms-client/commit/fed32fe85dcb5aa51ee44adf6c70bfc9f15d2d62))
* Trigger release generation on develop branch ([#3770](https://github.com/cds-snc/platform-forms-client/issues/3770)) ([7f5c4f4](https://github.com/cds-snc/platform-forms-client/commit/7f5c4f4df59563a6bb5f44a9d6b74bf581921344))
* trusted host check and NEXTAUTH_URL ([#3778](https://github.com/cds-snc/platform-forms-client/issues/3778)) ([58ab090](https://github.com/cds-snc/platform-forms-client/commit/58ab09034916b221322d480799627a58bf3f5b49))
* WIP JWT session optimization ([#3669](https://github.com/cds-snc/platform-forms-client/issues/3669)) ([f959a34](https://github.com/cds-snc/platform-forms-client/commit/f959a3496e127dbab2839532420dd888dfee2541))

## [3.12.11](https://github.com/cds-snc/platform-forms-client/compare/v3.12.10...v3.12.11) (2024-03-26)

### Miscellaneous Chores

- Add Canadian Space Agency branding ([#3417](https://github.com/cds-snc/platform-forms-client/issues/3417)) ([e1ad3ca](https://github.com/cds-snc/platform-forms-client/commit/e1ad3ca67bc22533c648cadbca4a8a567ecfc209))

## [3.12.10](https://github.com/cds-snc/platform-forms-client/compare/v3.12.9...v3.12.10) (2024-03-13)

### Bug Fixes

- Password reset is case sensitive for user emails ([#3324](https://github.com/cds-snc/platform-forms-client/issues/3324)) ([ba64788](https://github.com/cds-snc/platform-forms-client/commit/ba6478817daabf2bea4f657a92f36fa61df2ca44))

## [3.12.9](https://github.com/cds-snc/platform-forms-client/compare/v3.12.8...v3.12.9) (2024-03-12)

### Miscellaneous Chores

- Add Library and Archives Canada branding ([#3317](https://github.com/cds-snc/platform-forms-client/issues/3317)) ([fb28674](https://github.com/cds-snc/platform-forms-client/commit/fb28674e52653f3215a13b9ff284a3c259c492ef))

## [3.12.8](https://github.com/cds-snc/platform-forms-client/compare/v3.12.7...v3.12.8) (2024-03-11)

### Bug Fixes

- add comment - 3314 ([#3316](https://github.com/cds-snc/platform-forms-client/issues/3316)) ([c09a6eb](https://github.com/cds-snc/platform-forms-client/commit/c09a6eb41cfd75148a012dda30f84283ee8335c6))
- Conditional Indicator ([#3314](https://github.com/cds-snc/platform-forms-client/issues/3314)) ([2c2cb61](https://github.com/cds-snc/platform-forms-client/commit/2c2cb610175c2aa0a5741e14ef54a6ce024f0cfe))

## [3.12.7](https://github.com/cds-snc/platform-forms-client/compare/v3.12.6...v3.12.7) (2024-02-29)

### Bug Fixes

- Nested conditional rule ([#3295](https://github.com/cds-snc/platform-forms-client/issues/3295)) ([64a2a44](https://github.com/cds-snc/platform-forms-client/commit/64a2a4466f08ea28bf03a419226414ff518fb8f4))

### Miscellaneous Chores

- Rename NEXTAUTH_URL as it is no longer required for Next-Auth ([#3288](https://github.com/cds-snc/platform-forms-client/issues/3288)) ([6ea5064](https://github.com/cds-snc/platform-forms-client/commit/6ea506440a5c3742f72716336354eb2f3d2c0744))

## [3.12.6](https://github.com/cds-snc/platform-forms-client/compare/v3.12.5...v3.12.6) (2024-02-22)

### Bug Fixes

- retrieve internal user id instead and pass it to the UserSignIn audit log instead of using the Cognito sub id ([#3266](https://github.com/cds-snc/platform-forms-client/issues/3266)) ([981336f](https://github.com/cds-snc/platform-forms-client/commit/981336f1f6cf8bf135c26d9fcf06ee98af9ab1b4))

### Miscellaneous Chores

- Add files Statistics Canada branding ([#3269](https://github.com/cds-snc/platform-forms-client/issues/3269)) ([2c2985c](https://github.com/cds-snc/platform-forms-client/commit/2c2985ca84350b3bbf094948f095f61998000b78))
- added new migration script to make existing audit logs archivable ([#3268](https://github.com/cds-snc/platform-forms-client/issues/3268)) ([9210ffd](https://github.com/cds-snc/platform-forms-client/commit/9210ffdd7dfc1e74d0dfff625e36f13cab029775))
- improve archivable audit logs migration script ([#3276](https://github.com/cds-snc/platform-forms-client/issues/3276)) ([8f99098](https://github.com/cds-snc/platform-forms-client/commit/8f9909860188a3e6618d54dbb5f5d6b35862623d))
- Set User type to have mandatory email ([#3252](https://github.com/cds-snc/platform-forms-client/issues/3252)) ([a7e75a8](https://github.com/cds-snc/platform-forms-client/commit/a7e75a83465600d38c21195d2d1f3c493be6aca6))

## [3.12.5](https://github.com/cds-snc/platform-forms-client/compare/v3.12.4...v3.12.5) (2024-02-12)

### Bug Fixes

- Delete forms with unprocessed submission is not warning user ([#3244](https://github.com/cds-snc/platform-forms-client/issues/3244)) ([3988d75](https://github.com/cds-snc/platform-forms-client/commit/3988d756adec58fe3076b89468cd7fe77e1bd22a))
- String ID showing up rather than text itself ([#3247](https://github.com/cds-snc/platform-forms-client/issues/3247)) ([c2f8134](https://github.com/cds-snc/platform-forms-client/commit/c2f8134f1365072247df62b450ccbf461f9afa2d))

### Miscellaneous Chores

- cleaning up content on translations page ([#3210](https://github.com/cds-snc/platform-forms-client/issues/3210)) ([faa1263](https://github.com/cds-snc/platform-forms-client/commit/faa12633ddf7382bb2ae51dc52933a39cb01501c))
- **deps:** update all non-major github action dependencies ([#3231](https://github.com/cds-snc/platform-forms-client/issues/3231)) ([0827ae9](https://github.com/cds-snc/platform-forms-client/commit/0827ae905dc4e60c946bf447dab4d3a76eb3c003))
- small content tweaks found while testing ([#3233](https://github.com/cds-snc/platform-forms-client/issues/3233)) ([bcea609](https://github.com/cds-snc/platform-forms-client/commit/bcea6096401ec8f5e9885b4bbdff176aeca2a403))
- Update branding options ([#3183](https://github.com/cds-snc/platform-forms-client/issues/3183)) ([90f1050](https://github.com/cds-snc/platform-forms-client/commit/90f10507d10b56328b33d552be302ce58092bd88))

## [3.12.4](https://github.com/cds-snc/platform-forms-client/compare/v3.12.3...v3.12.4) (2024-02-05)

### Bug Fixes

- conditional indicator question number output ([#3229](https://github.com/cds-snc/platform-forms-client/issues/3229)) ([0a9b0c4](https://github.com/cds-snc/platform-forms-client/commit/0a9b0c4b6eb39633fea3970d8473ee6dcd48597e))

### Miscellaneous Chores

- **deps:** update all non-major github action dependencies ([#3014](https://github.com/cds-snc/platform-forms-client/issues/3014)) ([51d4ae4](https://github.com/cds-snc/platform-forms-client/commit/51d4ae4eea0ba16072dbe9935bb3a9085e50fcaf))
- update branding settings to link to new form ([#3212](https://github.com/cds-snc/platform-forms-client/issues/3212)) ([405ab3b](https://github.com/cds-snc/platform-forms-client/commit/405ab3b16cf36ece7c744ca82cf60a226019cbe6))

## [3.12.3](https://github.com/cds-snc/platform-forms-client/compare/v3.12.2...v3.12.3) (2024-01-31)

### Bug Fixes

- conditional indicator question number output ([#3229](https://github.com/cds-snc/platform-forms-client/issues/3229)) ([0a9b0c4](https://github.com/cds-snc/platform-forms-client/commit/0a9b0c4b6eb39633fea3970d8473ee6dcd48597e))

### Miscellaneous Chores

- **deps:** update all non-major github action dependencies ([#3014](https://github.com/cds-snc/platform-forms-client/issues/3014)) ([51d4ae4](https://github.com/cds-snc/platform-forms-client/commit/51d4ae4eea0ba16072dbe9935bb3a9085e50fcaf))
- update branding settings to link to new form ([#3212](https://github.com/cds-snc/platform-forms-client/issues/3212)) ([405ab3b](https://github.com/cds-snc/platform-forms-client/commit/405ab3b16cf36ece7c744ca82cf60a226019cbe6))

## [3.12.3](https://github.com/cds-snc/platform-forms-client/compare/v3.12.2...v3.12.3) (2024-01-31)

### Bug Fixes

- request new 2FA code does not work if there is no active 2FA session ([#3193](https://github.com/cds-snc/platform-forms-client/issues/3193)) ([a57b64e](https://github.com/cds-snc/platform-forms-client/commit/a57b64ecbb948871774823fc8d46304b4959dd7d))
- validation when conditional rules array is empty ([#3205](https://github.com/cds-snc/platform-forms-client/issues/3205)) ([5ae78e0](https://github.com/cds-snc/platform-forms-client/commit/5ae78e0937056f4640e2a5b562f066a36a18eac1))

### Miscellaneous Chores

- synced file(s) with cds-snc/site-reliability-engineering ([#3036](https://github.com/cds-snc/platform-forms-client/issues/3036)) ([97492ed](https://github.com/cds-snc/platform-forms-client/commit/97492edc914750751a2844993a61e2f6840ea447))

## [3.12.2](https://github.com/cds-snc/platform-forms-client/compare/v3.12.1...v3.12.2) (2024-01-30)

### Bug Fixes

- get choice lookup when question is removed ([#3190](https://github.com/cds-snc/platform-forms-client/issues/3190)) ([f3a79ad](https://github.com/cds-snc/platform-forms-client/commit/f3a79adc3dca8aca410f730d57886615ce4b8fdf))
- group validation ([#3155](https://github.com/cds-snc/platform-forms-client/issues/3155)) ([db87ce2](https://github.com/cds-snc/platform-forms-client/commit/db87ce24ea108acfd91f22b26799fd2f4c683754))
- settings modal save ([#3182](https://github.com/cds-snc/platform-forms-client/issues/3182)) ([9fd7965](https://github.com/cds-snc/platform-forms-client/commit/9fd796551c81919fd8193a4673633837d8c52dc3))
- use codeQL for javascript and typescript ([#3149](https://github.com/cds-snc/platform-forms-client/issues/3149)) ([c5d270b](https://github.com/cds-snc/platform-forms-client/commit/c5d270b4682b9b59f8ce3cee0c523d19ce1c0f27))

### Miscellaneous Chores

- switch back to prod deploy OIDC role ([#3148](https://github.com/cds-snc/platform-forms-client/issues/3148)) ([a15e26e](https://github.com/cds-snc/platform-forms-client/commit/a15e26e275ee4e4364f35cd730a9306ada1343e3))
- update name of health canada branding option ([#3151](https://github.com/cds-snc/platform-forms-client/issues/3151)) ([b7e2589](https://github.com/cds-snc/platform-forms-client/commit/b7e2589cd8e407932de1ad2e51e7b1dd5fc8ab32))

## [3.12.1](https://github.com/cds-snc/platform-forms-client/compare/v3.12.0...v3.12.1) (2024-01-25)

### Bug Fixes

- update page text rule indicator ([#3140](https://github.com/cds-snc/platform-forms-client/issues/3140)) ([31b8198](https://github.com/cds-snc/platform-forms-client/commit/31b8198ac9ec081becde21efc44285fcfe848515))

### Miscellaneous Chores

- fix filename save draft ([#3143](https://github.com/cds-snc/platform-forms-client/issues/3143)) ([66c35a5](https://github.com/cds-snc/platform-forms-client/commit/66c35a58183facfd92b3221d7179bf28b164e459))
- fix your account dropdown margin ([#3141](https://github.com/cds-snc/platform-forms-client/issues/3141)) ([6954009](https://github.com/cds-snc/platform-forms-client/commit/695400993e066120fc9eb7471eeadc59adc01036))
- update support error message logs ([#3146](https://github.com/cds-snc/platform-forms-client/issues/3146)) ([5659d93](https://github.com/cds-snc/platform-forms-client/commit/5659d934988915e65c0f87b2bbabe3663ee23d81))

## [3.12.0](https://github.com/cds-snc/platform-forms-client/compare/v3.11.0...v3.12.0) (2024-01-23)

### Features

- Add Element Dialog Refresh ([#3075](https://github.com/cds-snc/platform-forms-client/issues/3075)) ([c1f5bc4](https://github.com/cds-snc/platform-forms-client/commit/c1f5bc41c7c48d284e286ae6a286c8408eb6dc20))
- Adds ability to add rules / conditional logic for showing / hiding form elements, adds grouping logic (no UI yet) ([a756af4](https://github.com/cds-snc/platform-forms-client/commit/a756af4174b408d99f4219f79a3c8699f593eafa))

### Bug Fixes

- 3135 Fix choice language ([#3136](https://github.com/cds-snc/platform-forms-client/issues/3136)) ([932efe2](https://github.com/cds-snc/platform-forms-client/commit/932efe2effdbec45e30a0bd7b8dded1a82e765d3))
- Confirm Dialog allows badly formatter code to be submitted ([#3072](https://github.com/cds-snc/platform-forms-client/issues/3072)) ([ca65398](https://github.com/cds-snc/platform-forms-client/commit/ca6539872f699c08ba12b60a8068cc739b7e16bd))
- Don't append "copy" to title on duplicate richText elements ([#3131](https://github.com/cds-snc/platform-forms-client/issues/3131)) ([4a039b6](https://github.com/cds-snc/platform-forms-client/commit/4a039b62279568d5a5569cf5a6f32541d2986b09))
- update template subscribe ([#3121](https://github.com/cds-snc/platform-forms-client/issues/3121)) ([dd91934](https://github.com/cds-snc/platform-forms-client/commit/dd91934eb17aa6616840b86dd0eca3c834fb9cc0))

### Miscellaneous Chores

- add more information to null operation log message ([#3125](https://github.com/cds-snc/platform-forms-client/issues/3125)) ([0157a0f](https://github.com/cds-snc/platform-forms-client/commit/0157a0ffc9ce8f3d56da1221199126cec912f4f6))
- content updates ([0424ec8](https://github.com/cds-snc/platform-forms-client/commit/0424ec8185d1b3ea6a626118160c521359dd5efa))
- Move back link ([#3115](https://github.com/cds-snc/platform-forms-client/issues/3115)) ([808d6c0](https://github.com/cds-snc/platform-forms-client/commit/808d6c0f3863958583cfad497b03bd5297a04339))
- Move share button ([#3103](https://github.com/cds-snc/platform-forms-client/issues/3103)) ([89c1909](https://github.com/cds-snc/platform-forms-client/commit/89c1909436e3804975363cb7c03051babda69d9d))
- question selector dropdown fix ([#3126](https://github.com/cds-snc/platform-forms-client/issues/3126)) ([24411c1](https://github.com/cds-snc/platform-forms-client/commit/24411c14ca7963d51ad0d234f3f731e30f40d3ae))
- Remove element type filter for rules ([#3123](https://github.com/cds-snc/platform-forms-client/issues/3123)) ([4969d54](https://github.com/cds-snc/platform-forms-client/commit/4969d54aadbed57ce3d6df1485fe3b46321b8b6b))
- switch GitHub workflows to OIDC roles ([#3116](https://github.com/cds-snc/platform-forms-client/issues/3116)) ([ac27ff8](https://github.com/cds-snc/platform-forms-client/commit/ac27ff810c45578a2fc62a03a2de591a2ca9bffc))
- update left navigation styling ([#3120](https://github.com/cds-snc/platform-forms-client/issues/3120)) ([78835ee](https://github.com/cds-snc/platform-forms-client/commit/78835eee1dedfd0675d73d1175b5b54aa7ef6984))

## [3.11.0](https://github.com/cds-snc/platform-forms-client/compare/v3.10.1...v3.11.0) (2023-12-28)

### Features

- Add pagination to Responses ([#3005](https://github.com/cds-snc/platform-forms-client/issues/3005)) ([1550c82](https://github.com/cds-snc/platform-forms-client/commit/1550c8280d05736b4a256a9b8c6abe1bb79226da))

### Miscellaneous Chores

- with the new infra update LOCAL_LAMBDA_ENDPOINT is now replaced by LOCAL_AWS_ENDPOINT ([#3019](https://github.com/cds-snc/platform-forms-client/issues/3019)) ([47c2d24](https://github.com/cds-snc/platform-forms-client/commit/47c2d24c7b9ffef580d2218f23cebf593ad45f22))

## [3.10.1](https://github.com/cds-snc/platform-forms-client/compare/v3.10.0...v3.10.1) (2023-12-08)

### Bug Fixes

- check that subItem is an array before mapping ([#3009](https://github.com/cds-snc/platform-forms-client/issues/3009)) ([71eb977](https://github.com/cds-snc/platform-forms-client/commit/71eb97700946d73b3bcda3082bbf3f3b8a0d1e23))

## [3.10.0](https://github.com/cds-snc/platform-forms-client/compare/v3.9.1...v3.10.0) (2023-12-07)

### Features

- Render Responses page navigation as tabs ([#3002](https://github.com/cds-snc/platform-forms-client/issues/3002)) ([c052c9b](https://github.com/cds-snc/platform-forms-client/commit/c052c9be52840fe8966f87a08145d3f50486d9ca))

### Bug Fixes

- Download ensure questions/answers are sorted according to form.layout ([#3001](https://github.com/cds-snc/platform-forms-client/issues/3001)) ([5d50d5a](https://github.com/cds-snc/platform-forms-client/commit/5d50d5a94c81e017850633e5dfeeed6cc03f9415))

## [3.9.1](https://github.com/cds-snc/platform-forms-client/compare/v3.9.0...v3.9.1) (2023-12-05)

### Bug Fixes

- run promises synchronously when making requests to DynamoDB ([7b58279](https://github.com/cds-snc/platform-forms-client/commit/7b582798d440962034ef9f2b8209e6bcb09b5a46))

### Miscellaneous Chores

- **deps:** update all non-major github action dependencies ([#2995](https://github.com/cds-snc/platform-forms-client/issues/2995)) ([be02cee](https://github.com/cds-snc/platform-forms-client/commit/be02cee47684c2053f7ad4cc71d257efa7068537))

## [3.9.0](https://github.com/cds-snc/platform-forms-client/compare/v3.8.3...v3.9.0) (2023-12-04)

### Features

- Download and confirmation flow. New download formats (.zip, .csv .json) ([81fc8ab](https://github.com/cds-snc/platform-forms-client/commit/81fc8abc50874cae7d9dc4354b9c75cbdb6437ee))
- Log GA event when downloading to record selected format ([#2993](https://github.com/cds-snc/platform-forms-client/issues/2993)) ([2dac2a2](https://github.com/cds-snc/platform-forms-client/commit/2dac2a24fc0b61f14f970937f840cee0daa474d1))

### Bug Fixes

- Allow no empty submissions ([#2990](https://github.com/cds-snc/platform-forms-client/issues/2990)) ([61e1daf](https://github.com/cds-snc/platform-forms-client/commit/61e1dafa2f9a6eaa7c341f8afb65c4b1884a1a58))
- Download receipt first ([#2988](https://github.com/cds-snc/platform-forms-client/issues/2988)) ([2fbd618](https://github.com/cds-snc/platform-forms-client/commit/2fbd6186f55eb7d32efbc83813587cb775af9f3a))
- Move zipping of individual HTML files to client side ([#2937](https://github.com/cds-snc/platform-forms-client/issues/2937)) ([0ddf2fd](https://github.com/cds-snc/platform-forms-client/commit/0ddf2fd40097d90cb35738f3f5418248bad34e0f))

### Miscellaneous Chores

- Contact us form iteration ([#2899](https://github.com/cds-snc/platform-forms-client/issues/2899)) ([510707d](https://github.com/cds-snc/platform-forms-client/commit/510707d467283c9a29f36db3530fa43e1d53eed8))
- **deps:** update all patch dependencies ([#2996](https://github.com/cds-snc/platform-forms-client/issues/2996)) ([6a5c68f](https://github.com/cds-snc/platform-forms-client/commit/6a5c68fd4388d172ec9ebae0fd8c785ed050423f))
- Updates to error message content ([#2846](https://github.com/cds-snc/platform-forms-client/issues/2846)) ([2bd0af3](https://github.com/cds-snc/platform-forms-client/commit/2bd0af346427ef13df04c45abe53efa80d42a18a))

## [3.8.3](https://github.com/cds-snc/platform-forms-client/compare/v3.8.2...v3.8.3) (2023-11-28)

### Bug Fixes

- **deps:** update dependency next-auth to v4.24.5 [security] ([#2878](https://github.com/cds-snc/platform-forms-client/issues/2878)) ([cbd5425](https://github.com/cds-snc/platform-forms-client/commit/cbd54251336c6f36c89a43b2f293bb7b895c4b1e))

### Miscellaneous Chores

- Add Health Canada branding ([24c4f03](https://github.com/cds-snc/platform-forms-client/commit/24c4f031da3c8edb6e332fe197b7ed66265a26cd))
- created local '.github/workflows/backstage-catalog-helper.yml' from remote 'tools/sre_file_sync/backstage-catalog-helper.yml' ([8b69a8c](https://github.com/cds-snc/platform-forms-client/commit/8b69a8c66441e5614106f16b547eef77ab2dee30))
- **deps:** lock file maintenance ([#2573](https://github.com/cds-snc/platform-forms-client/issues/2573)) ([c32f569](https://github.com/cds-snc/platform-forms-client/commit/c32f56901a61c1544b6c6d9eef362bfd2a09a5a2))
- **deps:** pin dependencies ([#2798](https://github.com/cds-snc/platform-forms-client/issues/2798)) ([14e6cd2](https://github.com/cds-snc/platform-forms-client/commit/14e6cd234efff8bd0e2b40bea7dbc720b7b7bfe2))
- **deps:** update all non-major github action dependencies ([#2688](https://github.com/cds-snc/platform-forms-client/issues/2688)) ([9baf719](https://github.com/cds-snc/platform-forms-client/commit/9baf719dc95e081ab12a5a2d9598e08912d8fe74))
- **deps:** update all patch dependencies ([#2571](https://github.com/cds-snc/platform-forms-client/issues/2571)) ([a02451a](https://github.com/cds-snc/platform-forms-client/commit/a02451a4d17c03b4485e49e0d7c07f0f2f2fa8a4))
- Remove demo request from contact us form ([#2861](https://github.com/cds-snc/platform-forms-client/issues/2861)) ([549a9e8](https://github.com/cds-snc/platform-forms-client/commit/549a9e82711667f1700560f988d6ef17d5848932))
- remove stories files ([#2863](https://github.com/cds-snc/platform-forms-client/issues/2863)) ([83a5528](https://github.com/cds-snc/platform-forms-client/commit/83a55288b4706a3d3b3d5d61293379dd148ebcbf))
- remove unrequired env var ([#2864](https://github.com/cds-snc/platform-forms-client/issues/2864)) ([7002111](https://github.com/cds-snc/platform-forms-client/commit/7002111bf374386d4865ce1e26fa8affea817262))
- synced file(s) with cds-snc/site-reliability-engineering ([#2805](https://github.com/cds-snc/platform-forms-client/issues/2805)) ([8b69a8c](https://github.com/cds-snc/platform-forms-client/commit/8b69a8c66441e5614106f16b547eef77ab2dee30))
- Update link URLs with CDS website update ([#2897](https://github.com/cds-snc/platform-forms-client/issues/2897)) ([5851c39](https://github.com/cds-snc/platform-forms-client/commit/5851c3908b3e8b297639669cc91409a55ccbabe6))

## [3.8.2](https://github.com/cds-snc/platform-forms-client/compare/v3.8.1...v3.8.2) (2023-11-14)

### Bug Fixes

- docker file build and yarn ([#2836](https://github.com/cds-snc/platform-forms-client/issues/2836)) ([011b5f7](https://github.com/cds-snc/platform-forms-client/commit/011b5f7747569d0a38e332650be8aa72b8920b2a))
- Pad angle brackets in user uploaded json or text input to avoid html exception ([#2832](https://github.com/cds-snc/platform-forms-client/issues/2832)) ([8eff2ba](https://github.com/cds-snc/platform-forms-client/commit/8eff2ba51ef5bb9ec47c404e359c47eb9abd886c))

### Miscellaneous Chores

- Update Axios to 1.6.1 ([#2851](https://github.com/cds-snc/platform-forms-client/issues/2851)) ([db1809e](https://github.com/cds-snc/platform-forms-client/commit/db1809e53cd798337bff6fd315072d0598f0c481))
- upgrade to yarn 4 ([#2827](https://github.com/cds-snc/platform-forms-client/issues/2827)) ([bf7ea6c](https://github.com/cds-snc/platform-forms-client/commit/bf7ea6c650a02159773a9fb83cf4c3d8837d40e5))

## [3.8.1](https://github.com/cds-snc/platform-forms-client/compare/v3.8.0...v3.8.1) (2023-11-06)

### Miscellaneous Chores

- Fix typos and improve French content ([#2801](https://github.com/cds-snc/platform-forms-client/issues/2801)) ([1b7a9c3](https://github.com/cds-snc/platform-forms-client/commit/1b7a9c337f2c24c358f54a060e14962a52c1ef18))
- Remove isSaveable check ([#2823](https://github.com/cds-snc/platform-forms-client/issues/2823)) ([1671edd](https://github.com/cds-snc/platform-forms-client/commit/1671edd268566681623d53229ef84ec322c1ea38))

## [3.8.0](https://github.com/cds-snc/platform-forms-client/compare/v3.7.0...v3.8.0) (2023-11-06)

### Features

- form closing date ([#2792](https://github.com/cds-snc/platform-forms-client/issues/2792)) ([949c804](https://github.com/cds-snc/platform-forms-client/commit/949c804717fc3a6da566ffbf5905424a52463f61))

### Bug Fixes

- Fix manage forms delete ([#2816](https://github.com/cds-snc/platform-forms-client/issues/2816)) ([9df1f8a](https://github.com/cds-snc/platform-forms-client/commit/9df1f8a382de2437c706a5e458df8fab07791e8c))
- Handle publish error ([#2817](https://github.com/cds-snc/platform-forms-client/issues/2817)) ([faffec3](https://github.com/cds-snc/platform-forms-client/commit/faffec398c1ebc61d22f68c4a1709151b37c5c47))

### Miscellaneous Chores

- Add node-gyp ([#2822](https://github.com/cds-snc/platform-forms-client/issues/2822)) ([580ddd7](https://github.com/cds-snc/platform-forms-client/commit/580ddd7ca199161cd108415ecf002d3548284951))
- Federal Economic Development Agency for Southern Ontario branding ([#2818](https://github.com/cds-snc/platform-forms-client/issues/2818)) ([057382b](https://github.com/cds-snc/platform-forms-client/commit/057382b368275e5761ed2d3d2b8040227f499fcb))
- update node version ([#2820](https://github.com/cds-snc/platform-forms-client/issues/2820)) ([2ddb535](https://github.com/cds-snc/platform-forms-client/commit/2ddb535c7a9d859926f911de8b1ac1ddd2694eb6))

## [3.7.0](https://github.com/cds-snc/platform-forms-client/compare/v3.6.0...v3.7.0) (2023-11-01)

### Features

- Add SVG mime type on branding requests ([f2fd5ab](https://github.com/cds-snc/platform-forms-client/commit/f2fd5abf432f5c9f19407167342b14d0d6e54601))

### Miscellaneous Chores

- Add closing date to db ([#2799](https://github.com/cds-snc/platform-forms-client/issues/2799)) ([e12570f](https://github.com/cds-snc/platform-forms-client/commit/e12570ff35ba49e346aa96bcd1218a1e075fc627))
- Prep for response filtering and pagination ([#2800](https://github.com/cds-snc/platform-forms-client/issues/2800)) ([4511e73](https://github.com/cds-snc/platform-forms-client/commit/4511e730d630729812d27da75edcedb151f195a2))
- Utility to generate responses for development environment ([#2790](https://github.com/cds-snc/platform-forms-client/issues/2790)) ([f5044f6](https://github.com/cds-snc/platform-forms-client/commit/f5044f63b9f5e53c9421b26deffa2800f7734171))

## [3.6.0](https://github.com/cds-snc/platform-forms-client/compare/v3.5.1...v3.6.0) (2023-10-18)

### Features

- Settings modal + quick select panel ([#2739](https://github.com/cds-snc/platform-forms-client/issues/2739)) ([3eacebe](https://github.com/cds-snc/platform-forms-client/commit/3eacebefe8b7378ac4513c95649ce835f8b9dc49))

### Miscellaneous Chores

- added Bing ownership verification meta tag for staging env ([#2770](https://github.com/cds-snc/platform-forms-client/issues/2770)) ([d4a23a6](https://github.com/cds-snc/platform-forms-client/commit/d4a23a63452d61aa4406db0de193300fb061efc0))
- **deps:** update all non-major docker images ([#2687](https://github.com/cds-snc/platform-forms-client/issues/2687)) ([928458f](https://github.com/cds-snc/platform-forms-client/commit/928458f08145e8cd88c646da8def972593106423))
- fix acceptable use heading margin ([#2774](https://github.com/cds-snc/platform-forms-client/issues/2774)) ([f865101](https://github.com/cds-snc/platform-forms-client/commit/f8651017f3e7cacc37bbe7863ea0d2e8909b3b45))
- synced file(s) with cds-snc/site-reliability-engineering ([#2684](https://github.com/cds-snc/platform-forms-client/issues/2684)) ([67fdf3e](https://github.com/cds-snc/platform-forms-client/commit/67fdf3e5260bd46a348b6ad01cafc1a74ba378c2))
- Update privacy notice content ([#2754](https://github.com/cds-snc/platform-forms-client/issues/2754)) ([32a77f5](https://github.com/cds-snc/platform-forms-client/commit/32a77f51e74a31961b7585e11877886eda2ee7e0))
- update save button to only show on edit page ([#2769](https://github.com/cds-snc/platform-forms-client/issues/2769)) ([470025a](https://github.com/cds-snc/platform-forms-client/commit/470025a43bbc40eb5827ae1639a1316bb6745f03))
- Update/tweak content strings ([#2775](https://github.com/cds-snc/platform-forms-client/issues/2775)) ([f72282f](https://github.com/cds-snc/platform-forms-client/commit/f72282f0cf61af8fae55445fd236820c653f6116))

## [3.5.1](https://github.com/cds-snc/platform-forms-client/compare/v3.5.0...v3.5.1) (2023-10-12)

### Miscellaneous Chores

- Add SSC branding ([#2767](https://github.com/cds-snc/platform-forms-client/issues/2767)) ([e650a07](https://github.com/cds-snc/platform-forms-client/commit/e650a07844f668bd35ef9b97e08533f79acda903))
- add verification files instead of meta tags for Google and Bing search engines inspection tools ([#2765](https://github.com/cds-snc/platform-forms-client/issues/2765)) ([0d1b4aa](https://github.com/cds-snc/platform-forms-client/commit/0d1b4aabfa37a9360e513e038f39970b0b75ef26))

## [3.5.0](https://github.com/cds-snc/platform-forms-client/compare/v3.4.11...v3.5.0) (2023-10-11)

### Features

- add noindex, nofollow instructions for search engine robots ([#2746](https://github.com/cds-snc/platform-forms-client/issues/2746)) ([e396be1](https://github.com/cds-snc/platform-forms-client/commit/e396be1ad9f70780f79f44f372cea1e6c5f52053))

### Bug Fixes

- add noindex meta tag in Staging on all pages including root index ([#2750](https://github.com/cds-snc/platform-forms-client/issues/2750)) ([4cfd5af](https://github.com/cds-snc/platform-forms-client/commit/4cfd5afe57e6af3c6e28a39250c10fd81da200bb))
- all required message ([#2764](https://github.com/cds-snc/platform-forms-client/issues/2764)) ([52c6b19](https://github.com/cds-snc/platform-forms-client/commit/52c6b19ab2246daf9f8e0ec38c7fc3bbfdf398d0))
- Ensure no indexing all sites except production ([#2757](https://github.com/cds-snc/platform-forms-client/issues/2757)) ([fbaa351](https://github.com/cds-snc/platform-forms-client/commit/fbaa351b2c8f398e4265e577aa5b175f98747c84))

### Miscellaneous Chores

- add google site verification meta tag ([#2762](https://github.com/cds-snc/platform-forms-client/issues/2762)) ([d1562ef](https://github.com/cds-snc/platform-forms-client/commit/d1562ef3e0dc1ce7d8be31c53a79519bb315e0b6))
- Add tooltip component ([#2755](https://github.com/cds-snc/platform-forms-client/issues/2755)) ([b24cfc5](https://github.com/cds-snc/platform-forms-client/commit/b24cfc59d32d252c08eecf847ecbc1cf5b06066f))
- ensure white background for preview screen ([#2761](https://github.com/cds-snc/platform-forms-client/issues/2761)) ([8ea6d4a](https://github.com/cds-snc/platform-forms-client/commit/8ea6d4aa039664c2ea2398747dd8f454bd8ea153))
- Remove section-header default styling on h4 and add margin ([#2749](https://github.com/cds-snc/platform-forms-client/issues/2749)) ([561b0ca](https://github.com/cds-snc/platform-forms-client/commit/561b0cab56a461b9d0baef5862dd4cdf0945f767))
- text sizing updates ([#2732](https://github.com/cds-snc/platform-forms-client/issues/2732)) ([cf0bcee](https://github.com/cds-snc/platform-forms-client/commit/cf0bceefd19e4771169f6d5834d6aa14f5e39143))

## [3.4.11](https://github.com/cds-snc/platform-forms-client/compare/v3.4.10...v3.4.11) (2023-09-28)

### Miscellaneous Chores

- Add RCMP branding ([#2726](https://github.com/cds-snc/platform-forms-client/issues/2726)) ([a6b6075](https://github.com/cds-snc/platform-forms-client/commit/a6b607565c2b596f28f13cfcba738038ba754e91))

## [3.4.10](https://github.com/cds-snc/platform-forms-client/compare/v3.4.9...v3.4.10) (2023-09-28)

### Bug Fixes

- Adjust title and FIP in Preview on Test page to more closely match frontend styles ([#2718](https://github.com/cds-snc/platform-forms-client/issues/2718)) ([2c0b13a](https://github.com/cds-snc/platform-forms-client/commit/2c0b13a72903a5213d4fbeb19ef9789a6ee3b9e9))

### Miscellaneous Chores

- Fix support form duplicate word ([#2712](https://github.com/cds-snc/platform-forms-client/issues/2712)) ([5703568](https://github.com/cds-snc/platform-forms-client/commit/570356877e45d95315bfc5ff833200d8ada482de))
- text sizing and colour adjustments ([5ea0bb6](https://github.com/cds-snc/platform-forms-client/commit/5ea0bb663f8527c0d79146de09c1b37f43a3e0cb))
- Typography improvements and cleanup ([#2677](https://github.com/cds-snc/platform-forms-client/issues/2677)) ([56998db](https://github.com/cds-snc/platform-forms-client/commit/56998db04b92ac40e34092e923707ee638c6e93b))
- update preview header ([#2723](https://github.com/cds-snc/platform-forms-client/issues/2723)) ([c385162](https://github.com/cds-snc/platform-forms-client/commit/c38516245bd0e55ddee2256d8ae859a2a8d6ac82))
- update responses icon alignment ([#2724](https://github.com/cds-snc/platform-forms-client/issues/2724)) ([88d2e13](https://github.com/cds-snc/platform-forms-client/commit/88d2e1373e1e15781720d43e23760e418bfc4db6))

### Code Refactoring

- default forms to "all" ([#2713](https://github.com/cds-snc/platform-forms-client/issues/2713)) ([20143dc](https://github.com/cds-snc/platform-forms-client/commit/20143dc2c99041c4ed041904b1d57bf046f7bb81))
- update max with for static pages ([#2721](https://github.com/cds-snc/platform-forms-client/issues/2721)) ([c971db4](https://github.com/cds-snc/platform-forms-client/commit/c971db4367d0fb1c82aa1a54526e616f190ca05b))

## [3.4.9](https://github.com/cds-snc/platform-forms-client/compare/v3.4.8...v3.4.9) (2023-09-26)

### Bug Fixes

- Remove grid type from formID ([#2710](https://github.com/cds-snc/platform-forms-client/issues/2710)) ([3dbe449](https://github.com/cds-snc/platform-forms-client/commit/3dbe44903a45ebc495ea362fe55be4ed120f5087))

## [3.4.8](https://github.com/cds-snc/platform-forms-client/compare/v3.4.7...v3.4.8) (2023-09-26)

### Bug Fixes

- Forms nav fix aria label and ids ([#2705](https://github.com/cds-snc/platform-forms-client/issues/2705)) ([aa01774](https://github.com/cds-snc/platform-forms-client/commit/aa01774410f1458d9c61f5ac3096521cc2bf7976))
- unauthenticated share modal padding ([#2708](https://github.com/cds-snc/platform-forms-client/issues/2708)) ([b01c844](https://github.com/cds-snc/platform-forms-client/commit/b01c844ff9ba5410497307e4f2375de8eec0bb59))

### Miscellaneous Chores

- a11y update card banner text colour ([#2709](https://github.com/cds-snc/platform-forms-client/issues/2709)) ([0e5ed17](https://github.com/cds-snc/platform-forms-client/commit/0e5ed17425e6bb5023d82fad6b58dbadd32e0795))
- fix typo in Forms page ([#2701](https://github.com/cds-snc/platform-forms-client/issues/2701)) ([789eda7](https://github.com/cds-snc/platform-forms-client/commit/789eda74ecca5bc2450ec44a0ffba1ee2d19f71e))
- update icons to fix alignment issues ([#2704](https://github.com/cds-snc/platform-forms-client/issues/2704)) ([1fa5888](https://github.com/cds-snc/platform-forms-client/commit/1fa588880201352ac8453770c816195a2651d7e2))

### Code Refactoring

- update alert styles ([#2700](https://github.com/cds-snc/platform-forms-client/issues/2700)) ([aded1bc](https://github.com/cds-snc/platform-forms-client/commit/aded1bc364fcf72f5afc5cafb8e21e7eb7b3ac5f))

## [3.4.7](https://github.com/cds-snc/platform-forms-client/compare/v3.4.6...v3.4.7) (2023-09-25)

### Bug Fixes

- radio button on settings page ([#2693](https://github.com/cds-snc/platform-forms-client/issues/2693)) ([f0915b2](https://github.com/cds-snc/platform-forms-client/commit/f0915b24b58b917b990a70889982ddf71bda8a87))
- Sentinel deploy metric product name ([#2676](https://github.com/cds-snc/platform-forms-client/issues/2676)) ([423e462](https://github.com/cds-snc/platform-forms-client/commit/423e462bcb411c452ab58d682cd987f8658c3996))
- Update ECS task def delete to set inactive ([#2671](https://github.com/cds-snc/platform-forms-client/issues/2671)) ([0c9b8b0](https://github.com/cds-snc/platform-forms-client/commit/0c9b8b01ab77d77bb6f54b09d0f8a6f8435047c3))

### Miscellaneous Chores

- Add release manifest code owners ([#2680](https://github.com/cds-snc/platform-forms-client/issues/2680)) ([0b5e278](https://github.com/cds-snc/platform-forms-client/commit/0b5e2781e4c9e1fe1e0960575de1730a91222d2d))
- Enable Prod ECS task def delete ([#2675](https://github.com/cds-snc/platform-forms-client/issues/2675)) ([414cc1d](https://github.com/cds-snc/platform-forms-client/commit/414cc1daae04a7535f67d2e49133d3f6f512a66f))
- Update (My/Your) Forms title for consistency ([#2679](https://github.com/cds-snc/platform-forms-client/issues/2679)) ([a81717d](https://github.com/cds-snc/platform-forms-client/commit/a81717d7a8090a2b9c53d03045d2ccb31f183870))
- Update Cypress to latest ([#2681](https://github.com/cds-snc/platform-forms-client/issues/2681)) ([fa17d85](https://github.com/cds-snc/platform-forms-client/commit/fa17d85a4e95ebd6ea14741f0f85a2a37b38cc40))
- update ticket subject lines ([#2690](https://github.com/cds-snc/platform-forms-client/issues/2690)) ([98f5212](https://github.com/cds-snc/platform-forms-client/commit/98f52128c2b2f77d54618e8b30b377f5adec1c1d))

### Code Refactoring

- change "/myforms" url to "/forms" ([#2683](https://github.com/cds-snc/platform-forms-client/issues/2683)) ([614fdf6](https://github.com/cds-snc/platform-forms-client/commit/614fdf617b4e06e67a07513af8a4e8bbe9284cb1))
- Update "forms" landing page ([#2678](https://github.com/cds-snc/platform-forms-client/issues/2678)) ([ab8e7da](https://github.com/cds-snc/platform-forms-client/commit/ab8e7da301ad5edfb9f5976c3b85126fec4227b5))

## [3.4.6](https://github.com/cds-snc/platform-forms-client/compare/v3.4.5...v3.4.6) (2023-09-20)

### Miscellaneous Chores

- Contact and Support form - Content tweaks ([#2651](https://github.com/cds-snc/platform-forms-client/issues/2651)) ([931c564](https://github.com/cds-snc/platform-forms-client/commit/931c564326da1048f5bcaff6181c166e3b63918c))
- enable automated Production ECS deploy ([#2669](https://github.com/cds-snc/platform-forms-client/issues/2669)) ([a5d9ef4](https://github.com/cds-snc/platform-forms-client/commit/a5d9ef4d32e82b1d4a04dd530aea7f97af67dfdb))

### Code Refactoring

- Modal design improvements ([#2666](https://github.com/cds-snc/platform-forms-client/issues/2666)) ([77b2405](https://github.com/cds-snc/platform-forms-client/commit/77b2405d51e1d73dc4cf60d01dbe40777baa4b66))

## [3.4.5](https://github.com/cds-snc/platform-forms-client/compare/v3.4.4...v3.4.5) (2023-09-19)

### Bug Fixes

- switch to OIDC role for prod deploy workflow ([#2667](https://github.com/cds-snc/platform-forms-client/issues/2667)) ([24b2ea8](https://github.com/cds-snc/platform-forms-client/commit/24b2ea80eb81da16cfee09f3ad8c9fdee33bab0a))

## [3.4.4](https://github.com/cds-snc/platform-forms-client/compare/v3.4.3...v3.4.4) (2023-09-19)

### Bug Fixes

- Cypress test for Share Modal and refactor for helpers ([#2643](https://github.com/cds-snc/platform-forms-client/issues/2643)) ([e1d280a](https://github.com/cds-snc/platform-forms-client/commit/e1d280af3b30128eaac33bce1786aeb5eb77c45f))
- Do not list all ID's when not required in audit logs ([#2660](https://github.com/cds-snc/platform-forms-client/issues/2660)) ([d7f8f4a](https://github.com/cds-snc/platform-forms-client/commit/d7f8f4ad31aac7d5b0d32bb94c84162afeef660c))

### Miscellaneous Chores

- Add automated production ECS task deploy ([#2635](https://github.com/cds-snc/platform-forms-client/issues/2635)) ([3ac8797](https://github.com/cds-snc/platform-forms-client/commit/3ac87978ebfe58a9f283e5892c80209f3a8fea9b))
- add ECS task def delete safety check ([#2645](https://github.com/cds-snc/platform-forms-client/issues/2645)) ([8b58231](https://github.com/cds-snc/platform-forms-client/commit/8b5823155ca714a820f74b81f56bf983c5cd075b))
- add ECS task definition delete workflow ([#2641](https://github.com/cds-snc/platform-forms-client/issues/2641)) ([f26ee0a](https://github.com/cds-snc/platform-forms-client/commit/f26ee0aea5bcc2a6da18e2f1fad8af91f719dd64))
- add freshdesk error handling ([#2633](https://github.com/cds-snc/platform-forms-client/issues/2633)) ([46fdbc8](https://github.com/cds-snc/platform-forms-client/commit/46fdbc8187c97105f5982fa690a4cd408c53abef))
- **deps:** update all non-major docker images ([#2570](https://github.com/cds-snc/platform-forms-client/issues/2570)) ([486174a](https://github.com/cds-snc/platform-forms-client/commit/486174a541c13a7df2cda64273a93920dd482a3e))
- **deps:** update all non-major github action dependencies ([#2572](https://github.com/cds-snc/platform-forms-client/issues/2572)) ([da158ae](https://github.com/cds-snc/platform-forms-client/commit/da158aed0b861f558c8937bfc16e160e313f25a5))
- **deps:** update all non-major github action dependencies ([#2653](https://github.com/cds-snc/platform-forms-client/issues/2653)) ([98cadbd](https://github.com/cds-snc/platform-forms-client/commit/98cadbdbdcc167341509d589196345bac44a30db))
- **deps:** update postgres docker digest to bf0c7de ([#2652](https://github.com/cds-snc/platform-forms-client/issues/2652)) ([91846c1](https://github.com/cds-snc/platform-forms-client/commit/91846c11a9e8be6818b8460d89be65f6ab0fabb8))
- enable ECS task definition delete ([#2648](https://github.com/cds-snc/platform-forms-client/issues/2648)) ([7d7619e](https://github.com/cds-snc/platform-forms-client/commit/7d7619e584f4e3c41fb43b26553d8c9c638c7dd8))
- Freshdesk integration ([#2621](https://github.com/cds-snc/platform-forms-client/issues/2621)) ([e2b6bea](https://github.com/cds-snc/platform-forms-client/commit/e2b6bea1f9d0e7ca1cb716a459f95cd92993dffb))
- synced file(s) with cds-snc/site-reliability-engineering ([#2655](https://github.com/cds-snc/platform-forms-client/issues/2655)) ([c72f231](https://github.com/cds-snc/platform-forms-client/commit/c72f231e21e2186f23432f675326ef95576f62cb))
- use OIDC roles for ECS task def delete ([#2650](https://github.com/cds-snc/platform-forms-client/issues/2650)) ([bfcabbc](https://github.com/cds-snc/platform-forms-client/commit/bfcabbc2343c39a7f816bc0e2980a8cecfa00728))
- use SRE app token for Release Generator ([#2664](https://github.com/cds-snc/platform-forms-client/issues/2664)) ([dda6c02](https://github.com/cds-snc/platform-forms-client/commit/dda6c02a99a67103c0efc9e0cc2a55e732a2cea1))

### Code Refactoring

- Form builder design updates ([#2654](https://github.com/cds-snc/platform-forms-client/issues/2654)) ([1ba9b36](https://github.com/cds-snc/platform-forms-client/commit/1ba9b365a7fa6072eee004053e4fe460c29a7f64))
- Responses Dialogs ([#2638](https://github.com/cds-snc/platform-forms-client/issues/2638)) ([b751072](https://github.com/cds-snc/platform-forms-client/commit/b7510725b9fc22152a860075c725de0a25746202))
- Update FIP to use children ([#2640](https://github.com/cds-snc/platform-forms-client/issues/2640)) ([5699475](https://github.com/cds-snc/platform-forms-client/commit/5699475f7079cc427a0da194cd0a56328d7bef10))
- Update footer ([#2639](https://github.com/cds-snc/platform-forms-client/issues/2639)) ([937363b](https://github.com/cds-snc/platform-forms-client/commit/937363b1f66595fbb3139196b6e251118f80cb3b))
- update language selection page ([#2642](https://github.com/cds-snc/platform-forms-client/issues/2642)) ([fb581a5](https://github.com/cds-snc/platform-forms-client/commit/fb581a505638e6d4b3665117971b9f59767d8247))
- update start page ([#2649](https://github.com/cds-snc/platform-forms-client/issues/2649)) ([d63f33e](https://github.com/cds-snc/platform-forms-client/commit/d63f33e2cb3b3ead08c216841c03b506eed8eaba))

## [3.4.3](https://github.com/cds-snc/platform-forms-client/compare/v3.4.2...v3.4.3) (2023-09-11)

### Bug Fixes

- Could not delete form ([38e13fd](https://github.com/cds-snc/platform-forms-client/commit/38e13fdde3deadd24a947e90f7755cf70e4a7c31))

### Miscellaneous Chores

- synced file(s) with cds-snc/site-reliability-engineering ([#2603](https://github.com/cds-snc/platform-forms-client/issues/2603)) ([66954ee](https://github.com/cds-snc/platform-forms-client/commit/66954ee27361f0b7832262bc715025d785f3aab1))

## [3.4.2](https://github.com/cds-snc/platform-forms-client/compare/v3.4.1...v3.4.2) (2023-09-07)

### Bug Fixes

- Remove sub element parsing as it causes problems with long forms ([#2626](https://github.com/cds-snc/platform-forms-client/issues/2626)) ([8e7e9e5](https://github.com/cds-snc/platform-forms-client/commit/8e7e9e5bf873173efd82508fb11e8a4ed1d7876b))

### Miscellaneous Chores

- add meta tag for data variable (authenticated) on gtm ([#2597](https://github.com/cds-snc/platform-forms-client/issues/2597)) ([462881c](https://github.com/cds-snc/platform-forms-client/commit/462881ccec07a3d74678f453fef8c933ca8a6cd5))
- Refactor layouts ([#2587](https://github.com/cds-snc/platform-forms-client/issues/2587)) ([5437d4d](https://github.com/cds-snc/platform-forms-client/commit/5437d4d84f4a0cb62bb1eb13a16f2927022c9036))
- Remove common HeadMeta from frontend layout ([#2620](https://github.com/cds-snc/platform-forms-client/issues/2620)) ([34d0e75](https://github.com/cds-snc/platform-forms-client/commit/34d0e756047c100bb3ab7981a396b17f6138e02a))
- Remove leftnav from manage-permissions ([#2595](https://github.com/cds-snc/platform-forms-client/issues/2595)) ([20c3a05](https://github.com/cds-snc/platform-forms-client/commit/20c3a059e2f903b30fc807e2c30a70a6d0773229))

## [3.4.1](https://github.com/cds-snc/platform-forms-client/compare/v3.4.0...v3.4.1) (2023-08-24)

### Bug Fixes

- auth error reporting take 2 ([#2586](https://github.com/cds-snc/platform-forms-client/issues/2586)) ([69fa719](https://github.com/cds-snc/platform-forms-client/commit/69fa719b01d4dc256fbcae79e0cc68da71024890))
- next-auth error reporting ([#2581](https://github.com/cds-snc/platform-forms-client/issues/2581)) ([f770faf](https://github.com/cds-snc/platform-forms-client/commit/f770faf77d20eda5a209a96305b7689a4e2b6375))

### Miscellaneous Chores

- check session loading state on settings page ([#2576](https://github.com/cds-snc/platform-forms-client/issues/2576)) ([120474a](https://github.com/cds-snc/platform-forms-client/commit/120474a95c1f9f3fc9bf6ead3aa777c8e1ab9a3b))
- fix your account dropdown "hiding" ([#2574](https://github.com/cds-snc/platform-forms-client/issues/2574)) ([73695b1](https://github.com/cds-snc/platform-forms-client/commit/73695b10a5f08484d6192961319cc230d6a9c5fa))
- make left hand navigation links reusable ([#2588](https://github.com/cds-snc/platform-forms-client/issues/2588)) ([79ab967](https://github.com/cds-snc/platform-forms-client/commit/79ab967ade3bde7c02c9d4954cb02c11f2c5babc))
- new gtm tag for sign_up ([51cb5e5](https://github.com/cds-snc/platform-forms-client/commit/51cb5e5f5ad266ef407ec26dc5d34f0d8edde449))

## [3.4.0](https://github.com/cds-snc/platform-forms-client/compare/v3.3.0...v3.4.0) (2023-08-21)

### Features

- adding new gtm tag for unlocking publishing (request) ([#2539](https://github.com/cds-snc/platform-forms-client/issues/2539)) ([77c77ab](https://github.com/cds-snc/platform-forms-client/commit/77c77ab3db89c476f9fc005c93694253739b9c8a))
- Protected B updates ([#2374](https://github.com/cds-snc/platform-forms-client/issues/2374)) ([ed68e9f](https://github.com/cds-snc/platform-forms-client/commit/ed68e9ff8a5ef4a8c9ef5ac932f0874cdf5cce57))

### Bug Fixes

- Update account dropdown ([b0886ed](https://github.com/cds-snc/platform-forms-client/commit/b0886edee667b362292787431fae7d1f42880c77))

### Miscellaneous Chores

- add user email to account enable/disable Slack notifications ([#2558](https://github.com/cds-snc/platform-forms-client/issues/2558)) ([a950e0b](https://github.com/cds-snc/platform-forms-client/commit/a950e0b54ebde11140546b10651f12fc4cf805a3))
- added more context to NextAuth error logs ([#2562](https://github.com/cds-snc/platform-forms-client/issues/2562)) ([360b918](https://github.com/cds-snc/platform-forms-client/commit/360b918ded5138d1c5a8c42032cb5898a725420b))
- cleanup for left navigation ([#2556](https://github.com/cds-snc/platform-forms-client/issues/2556)) ([b783172](https://github.com/cds-snc/platform-forms-client/commit/b783172d9f374c2474c8dedde24cfce94933e421))
- Convert Attention components to new Alert ([#2547](https://github.com/cds-snc/platform-forms-client/issues/2547)) ([40efe5c](https://github.com/cds-snc/platform-forms-client/commit/40efe5c9c870a777d686b1d3cada3c83feb5117b))
- Convert forms/Alert components to new Alert ([#2557](https://github.com/cds-snc/platform-forms-client/issues/2557)) ([e821f39](https://github.com/cds-snc/platform-forms-client/commit/e821f39a267374ef948f935acb1bd588f7cd8b20))
- Convert globals/Alert components to new Alert ([#2552](https://github.com/cds-snc/platform-forms-client/issues/2552)) ([bc53f52](https://github.com/cds-snc/platform-forms-client/commit/bc53f52de7bcfbdf836e0ba7567687c9ff215088))
- simplify Alert imports ([#2560](https://github.com/cds-snc/platform-forms-client/issues/2560)) ([5cf7b24](https://github.com/cds-snc/platform-forms-client/commit/5cf7b24c3d51d6d433bce1b51ac66b5ae0781b7a))
- update global button ([#2561](https://github.com/cds-snc/platform-forms-client/issues/2561)) ([d40f264](https://github.com/cds-snc/platform-forms-client/commit/d40f264058e75c7a58df81fa15a958acc2fe27cc))
- Updates left nav to be more semantic ([#2553](https://github.com/cds-snc/platform-forms-client/issues/2553)) ([5907c6f](https://github.com/cds-snc/platform-forms-client/commit/5907c6fb7ed7481bb87f1259d6c2de860f1fb717))

## [3.3.0](https://github.com/cds-snc/platform-forms-client/compare/v3.2.0...v3.3.0) (2023-08-16)

### Features

- added unit tests around password reset library ([#2518](https://github.com/cds-snc/platform-forms-client/issues/2518)) ([ef1755b](https://github.com/cds-snc/platform-forms-client/commit/ef1755b35f65b34aa1b943ae50e4d56087ea06a8))
- added user email to ownership and privilege audit logs ([#2459](https://github.com/cds-snc/platform-forms-client/issues/2459)) ([5315839](https://github.com/cds-snc/platform-forms-client/commit/5315839fec49fd077decc418a1c23d92df56710a))
- Alerts refactor - create new Alert component for admin/FormBuilder ([#2446](https://github.com/cds-snc/platform-forms-client/issues/2446)) ([3122649](https://github.com/cds-snc/platform-forms-client/commit/3122649730b8a3cb7985a766e8e869e47bb23fca))

### Bug Fixes

- auth errors copy edits ([#2538](https://github.com/cds-snc/platform-forms-client/issues/2538)) ([0adec47](https://github.com/cds-snc/platform-forms-client/commit/0adec475bec3ff001b53fbeba98ae75ce27ccb45))
- check user privileges when setting security questions ([#2517](https://github.com/cds-snc/platform-forms-client/issues/2517)) ([f5e67bd](https://github.com/cds-snc/platform-forms-client/commit/f5e67bd5761c10d69e73a5ebf8de76f6b1ac8e2d))
- **deps:** update all patch dependencies ([#2529](https://github.com/cds-snc/platform-forms-client/issues/2529)) ([3ed8a5c](https://github.com/cds-snc/platform-forms-client/commit/3ed8a5ca40fab40cb85d8a75127021be345043d7))
- disables input field for form name on published forms ([#2507](https://github.com/cds-snc/platform-forms-client/issues/2507)) ([8c3caa0](https://github.com/cds-snc/platform-forms-client/commit/8c3caa0ff8cea46df77cdd33b905c1cb77473e23))
- display missing privilege in admin panel ([#2536](https://github.com/cds-snc/platform-forms-client/issues/2536)) ([6e08697](https://github.com/cds-snc/platform-forms-client/commit/6e08697ed7ce01c69514619571b131a78101eba6))
- make security questions unique in database schema ([#2516](https://github.com/cds-snc/platform-forms-client/issues/2516)) ([943ca22](https://github.com/cds-snc/platform-forms-client/commit/943ca2200adca0650553bfcd6d522e96245c20ca))
- privilege seeding ([#2541](https://github.com/cds-snc/platform-forms-client/issues/2541)) ([10d7436](https://github.com/cds-snc/platform-forms-client/commit/10d7436296eaae1d8ebe109cfe2109311811795c))
- Publish page heading levels ([#2537](https://github.com/cds-snc/platform-forms-client/issues/2537)) ([5d3ab43](https://github.com/cds-snc/platform-forms-client/commit/5d3ab43403df1797447cc7145a7b896be883a35a))
- Skip to main content redundant nav landmark region ([#2534](https://github.com/cds-snc/platform-forms-client/issues/2534)) ([dee9ea0](https://github.com/cds-snc/platform-forms-client/commit/dee9ea04850fcff54a24f1309f7d8702bee15f3a))
- token session ([#2531](https://github.com/cds-snc/platform-forms-client/issues/2531)) ([d1437a9](https://github.com/cds-snc/platform-forms-client/commit/d1437a912fd21d3cc4509914e9245d947e944f8a))

### Miscellaneous Chores

- Add Get Support link to Answer Security Questions ([#2525](https://github.com/cds-snc/platform-forms-client/issues/2525)) ([9dfa6c7](https://github.com/cds-snc/platform-forms-client/commit/9dfa6c75f5a84626aa4d2f9e585857749625bd28))
- Add Permissions-Policy header ([#2532](https://github.com/cds-snc/platform-forms-client/issues/2532)) ([315f5c0](https://github.com/cds-snc/platform-forms-client/commit/315f5c0ad4801ea5a9b3ab6e0be5f755babf57b9))
- **deps:** pin dependencies ([#2369](https://github.com/cds-snc/platform-forms-client/issues/2369)) ([5bf9ed3](https://github.com/cds-snc/platform-forms-client/commit/5bf9ed3ed6f2e698f2601d750bbe80fd999b4c5a))
- **deps:** update all non-major docker images ([#2527](https://github.com/cds-snc/platform-forms-client/issues/2527)) ([83febef](https://github.com/cds-snc/platform-forms-client/commit/83febef64fbf5137f4dd4b15b6dfcae87e2fa892))
- **deps:** update all non-major github action dependencies ([#2368](https://github.com/cds-snc/platform-forms-client/issues/2368)) ([bb8b43c](https://github.com/cds-snc/platform-forms-client/commit/bb8b43c3f1a9d4e41830e113a1e715c5fb059d20))
- **deps:** update all non-major github action dependencies ([#2528](https://github.com/cds-snc/platform-forms-client/issues/2528)) ([5c0c636](https://github.com/cds-snc/platform-forms-client/commit/5c0c636218f1d0f4e35be2dc8b74f345a9fe02f7))
- **deps:** update all patch dependencies ([#2434](https://github.com/cds-snc/platform-forms-client/issues/2434)) ([4d75fa7](https://github.com/cds-snc/platform-forms-client/commit/4d75fa7bd4aba197a16066206120aadff8cd2eff))
- fix security questions banner text ([#2550](https://github.com/cds-snc/platform-forms-client/issues/2550)) ([301fd35](https://github.com/cds-snc/platform-forms-client/commit/301fd350ad6899e31d12331268a920f7e1bb0dba))
- Form title line wrap ([#2526](https://github.com/cds-snc/platform-forms-client/issues/2526)) ([b27db37](https://github.com/cds-snc/platform-forms-client/commit/b27db3776ef1173fd9dcebd7911d1a80237bd45d))
- Remove password reset feature flag ([#2509](https://github.com/cds-snc/platform-forms-client/issues/2509)) ([c361d93](https://github.com/cds-snc/platform-forms-client/commit/c361d935498cef16cd4adc582eb48ac607efc1c4))

## [3.2.0](https://github.com/cds-snc/platform-forms-client/compare/v3.1.1...v3.2.0) (2023-08-03)

### Features

- Alarm on privilege escalation ([#2433](https://github.com/cds-snc/platform-forms-client/issues/2433)) ([0ef16f9](https://github.com/cds-snc/platform-forms-client/commit/0ef16f93aa28609445de65ecc25964cc3f02c309))
- deactivate user account ([#2281](https://github.com/cds-snc/platform-forms-client/issues/2281)) ([0698f44](https://github.com/cds-snc/platform-forms-client/commit/0698f448e8827bd42f218bcf233293599eeb50ad))
- Delete test responses on publish ([#2367](https://github.com/cds-snc/platform-forms-client/issues/2367)) ([08d91bf](https://github.com/cds-snc/platform-forms-client/commit/08d91bf13ea942d9a3a4d826e225fab2729169e2))
- don't trigger gta event on preview submissions ([#2400](https://github.com/cds-snc/platform-forms-client/issues/2400)) ([c0f3e8c](https://github.com/cds-snc/platform-forms-client/commit/c0f3e8c3f3ec0815fa7d0d2a3d9591175097ddd3))
- remove test/preview for published forms ([#2422](https://github.com/cds-snc/platform-forms-client/issues/2422)) ([294da5b](https://github.com/cds-snc/platform-forms-client/commit/294da5bcac4404e848f9f1363428df75866de746))

### Bug Fixes

- **deps:** update all patch dependencies ([#2407](https://github.com/cds-snc/platform-forms-client/issues/2407)) ([3694aa4](https://github.com/cds-snc/platform-forms-client/commit/3694aa4aa848ed0671caf3abf62cd25356465bf5))
- error handling for 2FAExpiredSession ([#2491](https://github.com/cds-snc/platform-forms-client/issues/2491)) ([e066bc1](https://github.com/cds-snc/platform-forms-client/commit/e066bc133d61e47a950aad7117f1c685dd2f6c98))
- form name not being set when title is set ([#2292](https://github.com/cds-snc/platform-forms-client/issues/2292)) ([f9acfa9](https://github.com/cds-snc/platform-forms-client/commit/f9acfa92024630d6e86ef0df529aedc330e26ad1))
- update audit logs to be more unique ([#2430](https://github.com/cds-snc/platform-forms-client/issues/2430)) ([f0804fa](https://github.com/cds-snc/platform-forms-client/commit/f0804fa166e281483f7217b05018ea80fccc31de))

### Documentation

- add info about local testing ([#2309](https://github.com/cds-snc/platform-forms-client/issues/2309)) ([7598ef2](https://github.com/cds-snc/platform-forms-client/commit/7598ef2b4f61c01942e46b248d821248ae4f76c9))
- update testing info ([#2327](https://github.com/cds-snc/platform-forms-client/issues/2327)) ([4969a8b](https://github.com/cds-snc/platform-forms-client/commit/4969a8b314a5cb25859fc6f484c317f592b59696))

### Miscellaneous Chores

- add tailwindcss eslint config ([888d6ee](https://github.com/cds-snc/platform-forms-client/commit/888d6eee2eab3e0141977de729a053ead7867100))
- **deps:** update all non-major docker images ([#2332](https://github.com/cds-snc/platform-forms-client/issues/2332)) ([c880147](https://github.com/cds-snc/platform-forms-client/commit/c88014779b565d83a7db16d558425ea1dcc52fd9))
- **deps:** update all non-major github action dependencies ([#2331](https://github.com/cds-snc/platform-forms-client/issues/2331)) ([43e0be7](https://github.com/cds-snc/platform-forms-client/commit/43e0be7a96156dea0d2461308be55d8f42e216a0))
- **deps:** update all patch dependencies ([#2297](https://github.com/cds-snc/platform-forms-client/issues/2297)) ([f66a772](https://github.com/cds-snc/platform-forms-client/commit/f66a77267b28d962592fe27894dc7ff0868871b9))
- fix contact us links for published page ([#2454](https://github.com/cds-snc/platform-forms-client/issues/2454)) ([aac5d5e](https://github.com/cds-snc/platform-forms-client/commit/aac5d5e8345fbf5cbe8ab006410f087590fbbb7c))
- refactor delete responses on publish ([#2431](https://github.com/cds-snc/platform-forms-client/issues/2431)) ([3428012](https://github.com/cds-snc/platform-forms-client/commit/3428012599bd1eb5b30313bec2b213a8cbee6a50))
- removed unused variable in DownloadTable.tsx ([#2474](https://github.com/cds-snc/platform-forms-client/issues/2474)) ([244b1a9](https://github.com/cds-snc/platform-forms-client/commit/244b1a917ff1d4a1f227026e88b0f165f670d204))
- Terms of use typo and formatting ([fb4ddd7](https://github.com/cds-snc/platform-forms-client/commit/fb4ddd7c57b48f95de21d1bb56203922793f4415))
- Update branding options ([#2449](https://github.com/cds-snc/platform-forms-client/issues/2449)) ([8fc26ec](https://github.com/cds-snc/platform-forms-client/commit/8fc26ecaf83d061217a517ba793e9fb80b84c58c))
- update debug config ([#2404](https://github.com/cds-snc/platform-forms-client/issues/2404)) ([a173a88](https://github.com/cds-snc/platform-forms-client/commit/a173a888ccbec794aec339c5882c6190e53c205a))
- update user table + add migrations for upcoming feature ([#2310](https://github.com/cds-snc/platform-forms-client/issues/2310)) ([2d1149f](https://github.com/cds-snc/platform-forms-client/commit/2d1149fa590daa9d518485b138cad3b0a0777f7c))

## [3.1.1](https://github.com/cds-snc/platform-forms-client/compare/v3.1.0...v3.1.1) (2023-06-19)

### Miscellaneous Chores

- **deps:** lock file maintenance ([#2298](https://github.com/cds-snc/platform-forms-client/issues/2298)) ([78b36c6](https://github.com/cds-snc/platform-forms-client/commit/78b36c624ad98d6410fb2bcf10d6b5754f1d9250))

## [3.1.0](https://github.com/cds-snc/platform-forms-client/compare/v3.0.12...v3.1.0) (2023-06-19)

### Features

- 2FA Authentication through Email ([#2133](https://github.com/cds-snc/platform-forms-client/issues/2133)) ([2cc568d](https://github.com/cds-snc/platform-forms-client/commit/2cc568d7b2a7c6a4dd7748c09748ddd9441b90f8))
- add Dockerfile to create Lambda PR review env ([#2221](https://github.com/cds-snc/platform-forms-client/issues/2221)) ([b15e19b](https://github.com/cds-snc/platform-forms-client/commit/b15e19b9a27aa5bf4a712e6d4087e6da0950cd74))
- workflow to sync PR review env vars ([#2282](https://github.com/cds-snc/platform-forms-client/issues/2282)) ([d27618b](https://github.com/cds-snc/platform-forms-client/commit/d27618bd72a94a5a8c1324433f0c4e119ded4fc3))
- workflows for PR Review environment ([#2243](https://github.com/cds-snc/platform-forms-client/issues/2243)) ([bc318e9](https://github.com/cds-snc/platform-forms-client/commit/bc318e972b72b0832c7030300d1f3d0138fe12de))

### Bug Fixes

- 2fa string updates ([#2265](https://github.com/cds-snc/platform-forms-client/issues/2265)) ([fdab140](https://github.com/cds-snc/platform-forms-client/commit/fdab1401b43d88d3d1bf26a15953cc4cff6b48c6))
- a11y misc ([1661da3](https://github.com/cds-snc/platform-forms-client/commit/1661da357f4dcef4ab5015ca9bd6eb46bf642320))
- add 2fa locked screen ([#2280](https://github.com/cds-snc/platform-forms-client/issues/2280)) ([b949797](https://github.com/cds-snc/platform-forms-client/commit/b9497971198a07dbb5077cc428dbba65f0626026))
- convert email address to lowercase before any Cognito API request ([#2276](https://github.com/cds-snc/platform-forms-client/issues/2276)) ([bfd6427](https://github.com/cds-snc/platform-forms-client/commit/bfd64273d8c52d779a400512762175c20394cbb1))
- cypress acceptable use page test ([#2239](https://github.com/cds-snc/platform-forms-client/issues/2239)) ([83b04e2](https://github.com/cds-snc/platform-forms-client/commit/83b04e2f526834dd998f750b7af2ed7296e31278))
- give focus to alert for create account and verify screens ([#2263](https://github.com/cds-snc/platform-forms-client/issues/2263)) ([424da5c](https://github.com/cds-snc/platform-forms-client/commit/424da5cd4cb3fe3a02c48f136bc9abaf8619dcdd))
- local devcontainer setup ([#2238](https://github.com/cds-snc/platform-forms-client/issues/2238)) ([e317299](https://github.com/cds-snc/platform-forms-client/commit/e317299346b3bcbe525465b9d1dd9f658c8dcf50))
- manually handle logout redirect for PR Review environments ([#2285](https://github.com/cds-snc/platform-forms-client/issues/2285)) ([ca6cd17](https://github.com/cds-snc/platform-forms-client/commit/ca6cd1791c5208fc94fd81f8ceea7a9f99c58899))
- remove AWS cli output for PR review envs ([#2286](https://github.com/cds-snc/platform-forms-client/issues/2286)) ([a6d4504](https://github.com/cds-snc/platform-forms-client/commit/a6d4504f466f573e88d336cbc4078b6d8048697b))
- update content to use security code vs verification code ([#2267](https://github.com/cds-snc/platform-forms-client/issues/2267)) ([fbda229](https://github.com/cds-snc/platform-forms-client/commit/fbda22920586cd7233424693a4763a89b76d34e3))

### Code Refactoring

- improve Prisma/Cognito user email migration code to handle failures gracefully ([#2293](https://github.com/cds-snc/platform-forms-client/issues/2293)) ([984ff60](https://github.com/cds-snc/platform-forms-client/commit/984ff60fe80555ea79ccca541ae1e6f90cf687a9))
- review Cognito/2FA thrown errors ([#2266](https://github.com/cds-snc/platform-forms-client/issues/2266)) ([88b0651](https://github.com/cds-snc/platform-forms-client/commit/88b0651499daf1a5a7be4b1abe15a72d93a0cdd3))

### Miscellaneous Chores

- **deps:** update all non-major docker images ([#2295](https://github.com/cds-snc/platform-forms-client/issues/2295)) ([b364f0d](https://github.com/cds-snc/platform-forms-client/commit/b364f0d31e1d6eeb1f17f2f30e51630e30a7e9d2))
- **deps:** update all non-major github action dependencies ([#2296](https://github.com/cds-snc/platform-forms-client/issues/2296)) ([8baf049](https://github.com/cds-snc/platform-forms-client/commit/8baf049dc5e685c0beb31c76fb7a858fa593514c))
- remove /admin/login page ([#2257](https://github.com/cds-snc/platform-forms-client/issues/2257)) ([2cb72df](https://github.com/cds-snc/platform-forms-client/commit/2cb72dff962fe182325a76b9941a237855a2e8ae))
- remove workflow trigger ([#2283](https://github.com/cds-snc/platform-forms-client/issues/2283)) ([6cd931b](https://github.com/cds-snc/platform-forms-client/commit/6cd931b00e11830d686253184175bef83333155f))

## [v3.0.12] 2023-06-07

### Fixed

- ReCaptcha should not be loaded in form builder preview mode
- Add branding for Canada Economic Development for Quebec Regions

## [v3.0.11] 2023-06-05

### Fixed

- GC Notify callback API should only handle form submission type of email
- Put back formTitle for Google Analytics and GTM

## [v3.0.10] 2023-06-01

### Fixed

- User Registration validation flow [`#2197`](https://github.com/cds-snc/platform-forms-client/pull/2197)

## [v3.0.9] 2023-05-31

### Fixed

- Password reset validation flow [`#2187`](https://github.com/cds-snc/platform-forms-client/pull/2187)

## [v3.0.8] 2023-05-30

### Fixed

- Fix bug 2168, part 2. [`#2180`](https://github.com/cds-snc/platform-forms-client/pull/2180)

## [v3.0.7] 2023-05-26

### Fixed

- Fixes ErrorPannel home link depending on auth status [`#2167`](https://github.com/cds-snc/platform-forms-client/pull/2167)
- Fix/Bug 2168 [`#2170`](https://github.com/cds-snc/platform-forms-client/pull/2170)
- fix(deps): update all patch dependencies [`#2146`](https://github.com/cds-snc/platform-forms-client/pull/2146)
- Fix/dynamic rows and acceptable_use tests [`#2111`](https://github.com/cds-snc/platform-forms-client/pull/2111)

## Changed

- Consistent data removal length of time [`#2156`](https://github.com/cds-snc/platform-forms-client/pull/2156)
- chore(deps): update all non-major github action dependencies [`#2144`](https://github.com/cds-snc/platform-forms-client/pull/2144)
- Small content tweaks to Responses page [`#2163`](https://github.com/cds-snc/platform-forms-client/pull/2163)
- Chore/Remove migrations [`#2148`](https://github.com/cds-snc/platform-forms-client/pull/2148)
- Clarify description for Open a form file [`#2140`](https://github.com/cds-snc/platform-forms-client/pull/2140)
- chore(deps): update all non-major docker images [`#2145`](https://github.com/cds-snc/platform-forms-client/pull/2145)
- chore(deps): lock file maintenance [`#2147`](https://github.com/cds-snc/platform-forms-client/pull/2147)
- Small tweaks for reset password screens [`#2126`](https://github.com/cds-snc/platform-forms-client/pull/2126)
- Locale file updates - for password field [`#2124`](https://github.com/cds-snc/platform-forms-client/pull/2124)
- feat: updated unsupported browser page to be a static HTML page [`#2108`](https://github.com/cds-snc/platform-forms-client/pull/2108)
- Small tweak to terms of use [`#2119`](https://github.com/cds-snc/platform-forms-client/pull/2119)
- use hasError [`#2122`](https://github.com/cds-snc/platform-forms-client/pull/2122)
- Useauth hook refactor initial [`#2117`](https://github.com/cds-snc/platform-forms-client/pull/2117)
- Remove transmitting browser logging [`#2118`](https://github.com/cds-snc/platform-forms-client/pull/2118)
- Update account layout [`#2109`](https://github.com/cds-snc/platform-forms-client/pull/2109)

## [3.0.6] 2023-05-16

### Changed

- Updated unauthenticated view on form builder tabs (publish and responses). [1869](https://github.com/cds-snc/platform-forms-client/issues/1869)
- Allow more symbols to be used in passwords. [2095](https://github.com/cds-snc/platform-forms-client/issues/2095)
- Unsupported browser page has been updated. It will now load when accessed within Internet Explorer. [2081](https://github.com/cds-snc/platform-forms-client/issues/2081)

## [3.0.5] 2023-05-10

### Fixed

- Download API will not override a response status that is different than `New`. [2052](https://github.com/cds-snc/platform-forms-client/issues/2052)
- Language Toggle
- Button styling across the product
- Error message when a user tries to login and the service is unavailable
- Unsupported browser page / Java Script not enable page

## [3.0.4] 2023-05-05

### Fixed

- Expanding question inputs in form builder
- Language toggle not appearing on first page visit

## [3.0.3] 2023-05-03

### Fixed

- Responses page is not available if form does not exist (deleted). [2023](https://github.com/cds-snc/platform-forms-client/issues/2023)
- Content Changes
- Expanding title element in form builder

## [3.0.2] 2023-04-28

### Fixed

- Form submission timestamp is not reflecting current user timezone.[1860](https://github.com/cds-snc/platform-forms-client/issues/1860)
- Creating and sorting of form elements
- Content changes for clarity

## [3.0.1] 2023-04-25

### Fixed

- Branding options not appearing
- Content changes
- Performance optimizations

## [3.0.0] 2023-04-17

### Added

- Form Response retrieval interface
- Branding options for specific agencies and government entities
- Support and Contact us pages
- Audit Logs for user triggered events
- HTML format Form Response file
- Editable name for a form
- Ability to share a form through email
- Global application settings

### Changed

- Updated interface for Form Builder (form creation interface)
- Updated Form Builder navigation

### Removed

- Retrieval API
- Token and temporary token authentication

## [2.0.0] 2022-12-28

### Added

- Form Builder form creation interface
- User self registration
- Validation of a JSON Config to check the IDs of elements [#892](https://github.com/cds-snc/platform-forms-client/pull/892)
- Added login page [#867](https://github.com/cds-snc/platform-forms-client/issues/867)
- Added login page for temporary token [#900](https://github.com/cds-snc/platform-forms-client/pull/900)
- [BREAKING]: Modified the Prisma schema for the "User" table; removing the `admin` column, and adding the `role` column. After migrating, at least one user role will need to manually be set to `administrator` in order to login the Admin portion of the site. [#906](https://github.com/cds-snc/platform-forms-client/pull/906)
- Added file attachments to retrieval API [#909](https://github.com/cds-snc/platform-forms-client/pull/909)
- New login lockout mechanism plugged on existing temporary token API [#872](https://github.com/cds-snc/platform-forms-client/issues/872)
- Logout Page [#847] (https://github.com/cds-snc/platform-forms-client/issues/870)
- Admin feature to assign users to template [#1203](https://github.com/cds-snc/platform-forms-client/issues/1203)
- New API path to request publishing permission [#1226](https://github.com/cds-snc/platform-forms-client/issues/1226)
- Dynamic footer with SLA and Support links on admin and form builder related pages [#1080](https://github.com/cds-snc/platform-forms-client/issues/1080)

### Changed

- Updated Terms and conditions page + text link in the footer [#863](https://github.com/cds-snc/platform-forms-client/issues/863)
- Modified Role Based to Asset Based Access Control [#1176](https://github.com/cds-snc/platform-forms-client/pull/1176)
- Form templates are now marked as archived and will stay in the database for 30 more days before being deleted by a Lambda function. [#1166](https://github.com/cds-snc/platform-forms-client/issues/1166)
- The existing `publishingStatus` field from the form JSON configuration has been replaced by a `isPublished` data field in the database. It can be switch to `true` or `false` using the Template API. A migration process will automatically happen through the Prisma seeding process. [#1181](https://github.com/cds-snc/platform-forms-client/issues/1181)
- Form builder can only load form if the user has the permission to access it [#1228](https://github.com/cds-snc/platform-forms-client/issues/1228)

### Fixed

- Fix stuck "Loading..." animation after uploading a new JSON config. [#898](https://github.com/cds-snc/platform-forms-client/pull/898)
- Fix ReCaptcha feature being broken because of missing API Key.
- Last login time on acceptable use page was not formatted properly. [#949](https://github.com/cds-snc/platform-forms-client/issues/949)
- Fix logout session end date [#945](https://github.com/cds-snc/platform-forms-client/issues/945)
- Fix last login date format [#950](https://github.com/cds-snc/platform-forms-client/pull/950)
- Cleared email input field after successfully adding an email to Form Access [#954](https://github.com/cds-snc/platform-forms-client/pull/954)
- Returned only public properties for forms [#1038](https://github.com/cds-snc/platform-forms-client/pull/1038)
- Can't enable/disable user permissions in admin panel

### Removed

- Option to preview form submission email to through Notify [#1021](https://github.com/cds-snc/platform-forms-client/pull/1021)

## [1.3.0] 2022-07-15

### Added

- Make GC Branding in Footer configurable [#847](https://github.com/cds-snc/platform-forms-client/pull/847)

### Fixed

- Added CSRF token requirement to `api/log` endpoint [#835](https://github.com/cds-snc/platform-forms-client/pull/835)
- Welcome page link to design system (storybook) [#844](https://github.com/cds-snc/platform-forms-client/pull/844)
- Fix retrieval API [#845](https://github.com/cds-snc/platform-forms-client/pull/845)
- Fix loading of csp scripts to happen after Dom is loaded [#848](https://github.com/cds-snc/platform-forms-client/pull/848)
- Fix remaining characters display issue

## [No Release Version] 2022-06-14

## [1.3.0] 2022-07-15

### Added

- Make GC Branding in Footer configurable [#847](https://github.com/cds-snc/platform-forms-client/pull/847)

### Fixed

- Added CSRF token requirement to `api/log` endpoint [#835](https://github.com/cds-snc/platform-forms-client/pull/835)
- Welcome page link to design system (storybook) [#844](https://github.com/cds-snc/platform-forms-client/pull/844)
- Fix retrieval API [#845](https://github.com/cds-snc/platform-forms-client/pull/845)
- Fix loading of csp scripts to happen after Dom is loaded [#848](https://github.com/cds-snc/platform-forms-client/pull/848)
- Fix remaining characters display issue

## [No Release Version] 2022-06-14

### Added

- Validation of a JSON Config to check the IDs of elements [#892](https://github.com/cds-snc/platform-forms-client/pull/892)
- Added login page [#867](https://github.com/cds-snc/platform-forms-client/issues/867)
- Added login page for temporary token [#900](https://github.com/cds-snc/platform-forms-client/pull/900)
- [BREAKING]: Modified the Prisma schema for the "User" table; removing the `admin` column, and adding the `role` column. After migrating, at least one user role will need to manually be set to `administrator` in order to login the Admin portion of the site. [#906](https://github.com/cds-snc/platform-forms-client/pull/906)
- Added file attachments to retrieval API [#909](https://github.com/cds-snc/platform-forms-client/pull/909)
- New login lockout mechanism plugged on existing temporary token API [#872](https://github.com/cds-snc/platform-forms-client/issues/872)
- Logout Page [#847] (https://github.com/cds-snc/platform-forms-client/issues/870)
- Admin feature to assign users to template [#1203](https://github.com/cds-snc/platform-forms-client/issues/1203)
- New API path to request publishing permission [#1226](https://github.com/cds-snc/platform-forms-client/issues/1226)
- Dynamic footer with SLA and Support links on admin and form builder related pages [#1080](https://github.com/cds-snc/platform-forms-client/issues/1080)

### Changed

- Updated Terms and conditions page + text link in the footer [#863](https://github.com/cds-snc/platform-forms-client/issues/863)
- Modified Role Based to Asset Based Access Control [#1176](https://github.com/cds-snc/platform-forms-client/pull/1176)
- Form templates are now marked as archived and will stay in the database for 30 more days before being deleted by a Lambda function. [#1166](https://github.com/cds-snc/platform-forms-client/issues/1166)
- The existing `publishingStatus` field from the form JSON configuration has been replaced by a `isPublished` data field in the database. It can be switch to `true` or `false` using the Template API. A migration process will automatically happen through the Prisma seeding process. [#1181](https://github.com/cds-snc/platform-forms-client/issues/1181)
- Form builder can only load form if the user has the permission to access it [#1228](https://github.com/cds-snc/platform-forms-client/issues/1228)

### Fixed

- Fix stuck "Loading..." animation after uploading a new JSON config. [#898](https://github.com/cds-snc/platform-forms-client/pull/898)
- Fix ReCaptcha feature being broken because of missing API Key.
- Last login time on acceptable use page was not formatted properly. [#949](https://github.com/cds-snc/platform-forms-client/issues/949)
- Fix logout session end date [#945](https://github.com/cds-snc/platform-forms-client/issues/945)
- Fix last login date format [#950](https://github.com/cds-snc/platform-forms-client/pull/950)
- Cleared email input field after successfully adding an email to Form Access [#954](https://github.com/cds-snc/platform-forms-client/pull/954)
- Returned only public properties for forms [#1038](https://github.com/cds-snc/platform-forms-client/pull/1038)
- Can't enable/disable user permissions in admin panel

### Removed

- Option to preview form submission email to through Notify [#1021](https://github.com/cds-snc/platform-forms-client/pull/1021)
- `displayAlphaBanner` property in JSON form template is not supported anymore. [#772](https://github.com/cds-snc/platform-forms-client/issues/772)

## [1.3.0] 2022-07-15

### Added

- Make GC Branding in Footer configurable [#847](https://github.com/cds-snc/platform-forms-client/pull/847)

### Fixed

- Added CSRF token requirement to `api/log` endpoint [#835](https://github.com/cds-snc/platform-forms-client/pull/835)
- Welcome page link to design system (storybook) [#844](https://github.com/cds-snc/platform-forms-client/pull/844)
- Fix retrieval API [#845](https://github.com/cds-snc/platform-forms-client/pull/845)
- Fix loading of csp scripts to happen after Dom is loaded [#848](https://github.com/cds-snc/platform-forms-client/pull/848)
- Fix remaining characters display issue

## [No Release Version] 2022-06-14

### Added

- Logging admin activity in database [#700](https://github.com/cds-snc/platform-forms-client/issues/700)
- Add Cross-Site Request Forgery (CSRF) [#716] (https://github.com/cds-snc/platform-forms-client/issues/716)
- Data classification attributes. [#701](https://github.com/cds-snc/platform-forms-client/issues/701)

### Fixed

- Fixed retrieval API not returning all existing responses
- Removed the security attribute from the viewport.
- Added CSRF token requirement to `api/log` endpoint [#835]((https://github.com/cds-snc/platform-forms-client/pull/835)

### Changed

- Upgraded NextJS and other associated GCForms dependencies to next major version. [#725](https://github.com/cds-snc/platform-forms-client/pull/725)
- Redesigned file input button [#713](https://github.com/cds-snc/platform-forms-client/issues/713)
- Removed list of published forms from welcome page. [#712](https://github.com/cds-snc/platform-forms-client/issues/712)
- Upgraded Next-Auth to version 4 & modified backed to use Prisma [#739](https://github.com/cds-snc/platform-forms-client/pull/739)
- Changed ISOLATED_INSTANCE for APP_ENV [#825](https://github.com/cds-snc/platform-forms-client/pull/825)

## [1.2.0] 2022-04-19

### Added

- Add a character limit to `text input` and `textarea` [#691](https://github.com/cds-snc/platform-forms-client/pull/691)
- ReCAPTCHA V3 added on form submission
- Implementation of the DELETE method to take a string array of SubmissionIDs and mark the relevant items as retrieved and return the same list as a response if its successful [#694](https://github.com/cds-snc/platform-forms-client/pull/694)
- Consolidated the Privacy and Terms and Conditions pages with updated content. [#698](https://github.com/cds-snc/platform-forms-client/pull/698)
- New `/changelog` page. [#246](https://github.com/cds-snc/platform-forms-client/issues/246)
- New `maxNumberOfRows` property in JSON template for DynamicRow component configuration [#528](https://github.com/cds-snc/platform-forms-client/issues/528)
- Create a second GC Notify service account. [#698](https://github.com/cds-snc/platform-forms-client/issues/696)
- Make configurable GC branding in the footer. [#804](https://github.com/cds-snc/platform-forms-client/issues/804)

### Fixed

- Aligned HTTP methods on API requests to decommission request body `method` property.
- Changed CSS on ordered and unordered lists to align with beginning of page text.
- Open links from richText component in new Tab.
- Improved/fixed accessibility for file input component
- Fixed dropdown initial value not being displayed the same way across browsers
- Only public form template properties are available to unauthenticated sessions
- Set `Retrieved` value to 0 on initial push to vault table in the Reliability Queue [#191](https://github.com/cds-snc/forms-terraform/pull/191)

### Changed

- Moved the retrieval API to be under the path `id/[form]/retrieval`.This is to make the API experience more consistent by having the form ID passed in via the url parameter as opposed to a separate query argument [#694](https://github.com/cds-snc/platform-forms-client/pull/694)
- Usage of DynamoDocumentDBClient to deal with native JS types instead of DynamoDB serializations [#694](https://github.com/cds-snc/platform-forms-client/pull/694)
- Removed maxRecord query argument. This presented little value to the user. The retrieval API will now always return a maximum of up to 10 values at a time. [#694](https://github.com/cds-snc/platform-forms-client/pull/694)
- Design of DynamicRow component buttons [#528](https://github.com/cds-snc/platform-forms-client/issues/528)
- Logging strategy. Now sending info, warn and error log types to AWS [#699](https://github.com/cds-snc/platform-forms-client/issues/699)
- Upgraded NextJS and other associated GCForms dependencies to next major version. [#725](https://github.com/cds-snc/platform-forms-client/pull/725)

## [1.1.0] 2022-03-04

### Added

- Create secure API to deactivate a form owner associated with a form
- Create secure API to associate emails to a specific form.
- Send email through GC Notify when a new temporary token is generated
- A UI with tabs on the Form Settings page. [#486](https://github.com/cds-snc/platform-forms-client/pull/573)
- A tab on the Form Settings page that allows the user to see and refresh the bearer token.
- A tab on the Form Settings page that allows form access to be enabled / disabled for users.
- Replace the retrieval Api lambda implementation by an App backEnd API. [#481](https://github.com/cds-snc/platform-forms-client/issues/481)
- Log error when we detect that an expired bearer token has been used (will be used to trigger an alarm in AWS CloudWatch)
- Log error when we failed to generate a temporary token (will be used to trigger an alarm in AWS CloudWatch)
- Log user access to retrieval API
- Replace the asterisk on required fields with copy: "(required)"
- Ensure display order of error list matches the display order of the form elements.
- Implementation and accessibility testing of reCAPTCHA V3. [#570](https://github.com/cds-snc/platform-forms-client/issues/570)
- Prevent submission of form for a delayed period of time to help prevent spam submissions
- New API path `/api/notify-callback` to plug GC Notify callback feature

### Changed

- Renamed `organisation` to `organization` which has an impact on the API access path
- Modified the middleware functionality and separation of scopes between middlewares
- A user now needs to have an enabled admin flag (user table) to access the Admin Pages
- An admin user can now add and remove administrative privileges from other users.

### Fixed

- Google Tag manager iframe will no longer appear in other environment other then staging. [#563](https://github.com/cds-snc/platform-forms-client/pull/563)
- Form configuration upload now correctly displays the updated configuration instead of displaying old values. [#579](https://github.com/cds-snc/platform-forms-client/pull/597)
- Clicking a link clears the form. [#498](https://github.com/cds-snc/platform-forms-client/issues/498)
- AWS WAF blocking image uploads. [#434](https://github.com/cds-snc/platform-forms-client/issues/434)
- Form scrolling up on submit after fixing errors from first submit. [#160](https://github.com/cds-snc/platform-forms-client/issues/160)

## [1.0.4] 2021-12-3

### Added

- Add language of form submission to the Next JS submission API and lambda through the `Content-Language` HTTP header
- Add error messages for all elements within dynamic rows. [#520](https://github.com/cds-snc/platform-forms-client/pull/520)
- POST method to /id/[form]/bearer that allows the refreshing of bearer tokens
- `<br>` in long description string now create new lines [#541](https://github.com/cds-snc/platform-forms-client/pull/541)
- Added secure API to retrieve bearer token.
- Create secure API to retrieve list of emails associated with a form.

### Fixed

- When Adding a new row in Dynamic Row the focus automatically moves, and scrolls, to the heading of the new row. [#547](https://github.com/cds-snc/platform-forms-client/pull/547)
- When deleting a row in Dynamic Row the focus and scroll moves to the heading of the previous row. [#547](https://github.com/cds-snc/platform-forms-client/pull/547)
- For local development fixed the Preview Notify email functionality that was previously broken [#547](https://github.com/cds-snc/platform-forms-client/pull/547)
- Validation on Dynamic row was preventing form submission when no validation errors were being found. [#547](https://github.com/cds-snc/platform-forms-client/pull/547)
- Google Tag manger requried 'connect-src' in the content security policy to correctly load [#548](https://github.com/cds-snc/platform-forms-client/pull/548)

## [1.0.3] 2021-11-25

### Added

- Story template v1.0 [#433](https://github.com/cds-snc/platform-forms-client/pull/433)
- Handle file input in dynamic row components [#445](https://github.com/cds-snc/platform-forms-client/pull/445)
- Form templates json validation [#447](https://github.com/cds-snc/platform-forms-client/pull/447)
- Delete Dynamic Rows [#470](https://github.com/cds-snc/platform-forms-client/pull/470)
- Add language of submission to submission data [#519](https://github.com/cds-snc/platform-forms-client/pull/519)
- Create secure API to retrieve bearer token for a specific form [#525](https://github.com/cds-snc/platform-forms-client/pull/525)
- Add bearer token to templates [#526](https://github.com/cds-snc/platform-forms-client/pull/526)

### Fixed

### Changed

- Removed the intl phone component [#459](https://github.com/cds-snc/platform-forms-client/pull/459)
- Refactor datalayer code [#510](https://github.com/cds-snc/platform-forms-client/pull/510)

### Fixed

- Fix dynamic row highlighing [#442](https://github.com/cds-snc/platform-forms-client/pull/442)
- Make screen reader announce heading on confirmation page [#444](https://github.com/cds-snc/platform-forms-client/pull/444)
- Harmonized RichText and Checkbox/Radio label max width depending on screen ratio [#460](https://github.com/cds-snc/platform-forms-client/pull/460)
- Improve accessibility for top left corner logo [#477](https://github.com/cds-snc/platform-forms-client/pull/477)
- Enable users to navigate through checkboxes and radion buttons with context [#478](https://github.com/cds-snc/platform-forms-client/pull/478)
- Fixed mixed async/await and promise style in `processFormData` and `callLambda` [#519](https://github.com/cds-snc/platform-forms-client/pull/519)
- Fixed naming of `submit.tsx` to `submit.ts` [#519](https://github.com/cds-snc/platform-forms-client/pull/519)

### Security

- Move POSTGRES_PASSWORD to .env file [#446](https://github.com/cds-snc/platform-forms-client/pull/446)
- Add security headers and Content Security Policy [#452](https://github.com/cds-snc/platform-forms-client/pull/452)
- Fix hashes repeated in Content Security Policy [#457](https://github.com/cds-snc/platform-forms-client/pull/457)
- Upgrade ioredis from 4.27.6 to 4.27.9 [#461](https://github.com/cds-snc/platform-forms-client/pull/461)
- Upgrade dotenv from 9.0.0 to 10.0.0 [#462](https://github.com/cds-snc/platform-forms-client/pull/462)
- Upgrade postgres-migrations from 5.1.1 to 5.3.0 [#463](https://github.com/cds-snc/platform-forms-client/pull/463)
- Upgrade swr from 0.5.6 to 1.0.1 [#464](https://github.com/cds-snc/platform-forms-client/pull/464)
- Upgrade next from 11.1.0 to 11.1.2 [#465](https://github.com/cds-snc/platform-forms-client/pull/465)
- Delete files after s3 upload [#523](https://github.com/cds-snc/platform-forms-client/pull/523)

## [1.0.2] 2021-09-21

### Fixed

- Phone number input component was not WCAG compliant.

## [1.0.1] 2021-09-16

### Added

- Use a cache to fill frequent requests to the Template API to reduce overall load on Lambdas
- Enable support for development using local Lambdas
- Enable support for organizations and organization management through the admin panel
- Added validation on FileInput component to ensure the type and size of the file is valid
- Added `displayAlphaBanner` property to JSON form template. Defaulted to true for existing forms.
- Added updated phone number input that includes an international code drop down.
- Added a more accessible file upload component.

### Changed

- Remove unused debugging `console.logs()`
- Remove info level logging from production builds
- Dropdown component automatically adds a default empty option to the list of choices. It becomes the initial value so that we do not need to add it manually in the JSON file.

### Fixed

- When Feature 'Submit to Reliability Queue' is off do not treat the submission as an Error.
- Checkbox and Radio groups were not being correctly identified by Screen Readers
- Unpublished form cache not correctly set

### Removed

- Temporary routing for existing form Ids to newly assigned Ids.

## [1.0.0] 2021-06-24

⚠️ This release includes a data migration

🚩 This release includes features hidden behind feature flags

### Added

- Form Configuration
  - API endpoint for CRUD operations
  - Settings page to modify/delete an existing configuration
  - Uploads page to upload a new form configuration
- Submissions
  - Retrieval API endpoint
  - Submissions review page
- Authentication
  - Login to the administration pages using your cds-snc GSuite account
- Feature Flags
  - Enable/Disable various application functionality through the admin interface.
- Temporary routing for existing form Ids to newly assigned Ids. This routing will be removed in the next patched version release.

### Changed

- Submissions
  - Form submissions no longer include the Form Configuration as part of the request.

### Removed

- JSON files defining the form configurations are no longer stored within the `./forms` directory in the code repository.

## [0.0.1] 2020-05-11 - Initial launch

### Added

- Forms:
  - CDS Intake Form
