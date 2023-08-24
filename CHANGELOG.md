# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.1](https://github.com/cds-snc/platform-forms-client/compare/v3.4.0...v3.4.1) (2023-08-24)


### Bug Fixes

* auth error reporting take 2 ([#2586](https://github.com/cds-snc/platform-forms-client/issues/2586)) ([69fa719](https://github.com/cds-snc/platform-forms-client/commit/69fa719b01d4dc256fbcae79e0cc68da71024890))
* next-auth error reporting ([#2581](https://github.com/cds-snc/platform-forms-client/issues/2581)) ([f770faf](https://github.com/cds-snc/platform-forms-client/commit/f770faf77d20eda5a209a96305b7689a4e2b6375))


### Miscellaneous Chores

* check session loading state on settings page ([#2576](https://github.com/cds-snc/platform-forms-client/issues/2576)) ([120474a](https://github.com/cds-snc/platform-forms-client/commit/120474a95c1f9f3fc9bf6ead3aa777c8e1ab9a3b))
* fix your account dropdown "hiding" ([#2574](https://github.com/cds-snc/platform-forms-client/issues/2574)) ([73695b1](https://github.com/cds-snc/platform-forms-client/commit/73695b10a5f08484d6192961319cc230d6a9c5fa))
* make left hand navigation links reusable ([#2588](https://github.com/cds-snc/platform-forms-client/issues/2588)) ([79ab967](https://github.com/cds-snc/platform-forms-client/commit/79ab967ade3bde7c02c9d4954cb02c11f2c5babc))
* new gtm tag for sign_up ([51cb5e5](https://github.com/cds-snc/platform-forms-client/commit/51cb5e5f5ad266ef407ec26dc5d34f0d8edde449))

## [3.4.0](https://github.com/cds-snc/platform-forms-client/compare/v3.3.0...v3.4.0) (2023-08-21)


### Features

* adding new gtm tag for unlocking publishing (request) ([#2539](https://github.com/cds-snc/platform-forms-client/issues/2539)) ([77c77ab](https://github.com/cds-snc/platform-forms-client/commit/77c77ab3db89c476f9fc005c93694253739b9c8a))
* Protected B updates ([#2374](https://github.com/cds-snc/platform-forms-client/issues/2374)) ([ed68e9f](https://github.com/cds-snc/platform-forms-client/commit/ed68e9ff8a5ef4a8c9ef5ac932f0874cdf5cce57))


### Bug Fixes

* Update account dropdown ([b0886ed](https://github.com/cds-snc/platform-forms-client/commit/b0886edee667b362292787431fae7d1f42880c77))


### Miscellaneous Chores

* add user email to account enable/disable Slack notifications ([#2558](https://github.com/cds-snc/platform-forms-client/issues/2558)) ([a950e0b](https://github.com/cds-snc/platform-forms-client/commit/a950e0b54ebde11140546b10651f12fc4cf805a3))
* added more context to NextAuth error logs ([#2562](https://github.com/cds-snc/platform-forms-client/issues/2562)) ([360b918](https://github.com/cds-snc/platform-forms-client/commit/360b918ded5138d1c5a8c42032cb5898a725420b))
* cleanup for left navigation ([#2556](https://github.com/cds-snc/platform-forms-client/issues/2556)) ([b783172](https://github.com/cds-snc/platform-forms-client/commit/b783172d9f374c2474c8dedde24cfce94933e421))
* Convert Attention components to new Alert ([#2547](https://github.com/cds-snc/platform-forms-client/issues/2547)) ([40efe5c](https://github.com/cds-snc/platform-forms-client/commit/40efe5c9c870a777d686b1d3cada3c83feb5117b))
* Convert forms/Alert components to new Alert ([#2557](https://github.com/cds-snc/platform-forms-client/issues/2557)) ([e821f39](https://github.com/cds-snc/platform-forms-client/commit/e821f39a267374ef948f935acb1bd588f7cd8b20))
* Convert globals/Alert components to new Alert ([#2552](https://github.com/cds-snc/platform-forms-client/issues/2552)) ([bc53f52](https://github.com/cds-snc/platform-forms-client/commit/bc53f52de7bcfbdf836e0ba7567687c9ff215088))
* simplify Alert imports ([#2560](https://github.com/cds-snc/platform-forms-client/issues/2560)) ([5cf7b24](https://github.com/cds-snc/platform-forms-client/commit/5cf7b24c3d51d6d433bce1b51ac66b5ae0781b7a))
* update global button ([#2561](https://github.com/cds-snc/platform-forms-client/issues/2561)) ([d40f264](https://github.com/cds-snc/platform-forms-client/commit/d40f264058e75c7a58df81fa15a958acc2fe27cc))
* Updates left nav to be more semantic ([#2553](https://github.com/cds-snc/platform-forms-client/issues/2553)) ([5907c6f](https://github.com/cds-snc/platform-forms-client/commit/5907c6fb7ed7481bb87f1259d6c2de860f1fb717))

## [3.3.0](https://github.com/cds-snc/platform-forms-client/compare/v3.2.0...v3.3.0) (2023-08-16)


### Features

* added unit tests around password reset library ([#2518](https://github.com/cds-snc/platform-forms-client/issues/2518)) ([ef1755b](https://github.com/cds-snc/platform-forms-client/commit/ef1755b35f65b34aa1b943ae50e4d56087ea06a8))
* added user email to ownership and privilege audit logs ([#2459](https://github.com/cds-snc/platform-forms-client/issues/2459)) ([5315839](https://github.com/cds-snc/platform-forms-client/commit/5315839fec49fd077decc418a1c23d92df56710a))
* Alerts refactor - create new Alert component for admin/FormBuilder ([#2446](https://github.com/cds-snc/platform-forms-client/issues/2446)) ([3122649](https://github.com/cds-snc/platform-forms-client/commit/3122649730b8a3cb7985a766e8e869e47bb23fca))


### Bug Fixes

* auth errors copy edits ([#2538](https://github.com/cds-snc/platform-forms-client/issues/2538)) ([0adec47](https://github.com/cds-snc/platform-forms-client/commit/0adec475bec3ff001b53fbeba98ae75ce27ccb45))
* check user privileges when setting security questions ([#2517](https://github.com/cds-snc/platform-forms-client/issues/2517)) ([f5e67bd](https://github.com/cds-snc/platform-forms-client/commit/f5e67bd5761c10d69e73a5ebf8de76f6b1ac8e2d))
* **deps:** update all patch dependencies ([#2529](https://github.com/cds-snc/platform-forms-client/issues/2529)) ([3ed8a5c](https://github.com/cds-snc/platform-forms-client/commit/3ed8a5ca40fab40cb85d8a75127021be345043d7))
* disables input field for form name on published forms ([#2507](https://github.com/cds-snc/platform-forms-client/issues/2507)) ([8c3caa0](https://github.com/cds-snc/platform-forms-client/commit/8c3caa0ff8cea46df77cdd33b905c1cb77473e23))
* display missing privilege in admin panel ([#2536](https://github.com/cds-snc/platform-forms-client/issues/2536)) ([6e08697](https://github.com/cds-snc/platform-forms-client/commit/6e08697ed7ce01c69514619571b131a78101eba6))
* make security questions unique in database schema ([#2516](https://github.com/cds-snc/platform-forms-client/issues/2516)) ([943ca22](https://github.com/cds-snc/platform-forms-client/commit/943ca2200adca0650553bfcd6d522e96245c20ca))
* privilege seeding ([#2541](https://github.com/cds-snc/platform-forms-client/issues/2541)) ([10d7436](https://github.com/cds-snc/platform-forms-client/commit/10d7436296eaae1d8ebe109cfe2109311811795c))
* Publish page heading levels ([#2537](https://github.com/cds-snc/platform-forms-client/issues/2537)) ([5d3ab43](https://github.com/cds-snc/platform-forms-client/commit/5d3ab43403df1797447cc7145a7b896be883a35a))
* Skip to main content redundant nav landmark region ([#2534](https://github.com/cds-snc/platform-forms-client/issues/2534)) ([dee9ea0](https://github.com/cds-snc/platform-forms-client/commit/dee9ea04850fcff54a24f1309f7d8702bee15f3a))
* token session ([#2531](https://github.com/cds-snc/platform-forms-client/issues/2531)) ([d1437a9](https://github.com/cds-snc/platform-forms-client/commit/d1437a912fd21d3cc4509914e9245d947e944f8a))


### Miscellaneous Chores

* Add Get Support link to Answer Security Questions ([#2525](https://github.com/cds-snc/platform-forms-client/issues/2525)) ([9dfa6c7](https://github.com/cds-snc/platform-forms-client/commit/9dfa6c75f5a84626aa4d2f9e585857749625bd28))
* Add Permissions-Policy header ([#2532](https://github.com/cds-snc/platform-forms-client/issues/2532)) ([315f5c0](https://github.com/cds-snc/platform-forms-client/commit/315f5c0ad4801ea5a9b3ab6e0be5f755babf57b9))
* **deps:** pin dependencies ([#2369](https://github.com/cds-snc/platform-forms-client/issues/2369)) ([5bf9ed3](https://github.com/cds-snc/platform-forms-client/commit/5bf9ed3ed6f2e698f2601d750bbe80fd999b4c5a))
* **deps:** update all non-major docker images ([#2527](https://github.com/cds-snc/platform-forms-client/issues/2527)) ([83febef](https://github.com/cds-snc/platform-forms-client/commit/83febef64fbf5137f4dd4b15b6dfcae87e2fa892))
* **deps:** update all non-major github action dependencies ([#2368](https://github.com/cds-snc/platform-forms-client/issues/2368)) ([bb8b43c](https://github.com/cds-snc/platform-forms-client/commit/bb8b43c3f1a9d4e41830e113a1e715c5fb059d20))
* **deps:** update all non-major github action dependencies ([#2528](https://github.com/cds-snc/platform-forms-client/issues/2528)) ([5c0c636](https://github.com/cds-snc/platform-forms-client/commit/5c0c636218f1d0f4e35be2dc8b74f345a9fe02f7))
* **deps:** update all patch dependencies ([#2434](https://github.com/cds-snc/platform-forms-client/issues/2434)) ([4d75fa7](https://github.com/cds-snc/platform-forms-client/commit/4d75fa7bd4aba197a16066206120aadff8cd2eff))
* fix security questions banner text ([#2550](https://github.com/cds-snc/platform-forms-client/issues/2550)) ([301fd35](https://github.com/cds-snc/platform-forms-client/commit/301fd350ad6899e31d12331268a920f7e1bb0dba))
* Form title line wrap ([#2526](https://github.com/cds-snc/platform-forms-client/issues/2526)) ([b27db37](https://github.com/cds-snc/platform-forms-client/commit/b27db3776ef1173fd9dcebd7911d1a80237bd45d))
* Remove password reset feature flag ([#2509](https://github.com/cds-snc/platform-forms-client/issues/2509)) ([c361d93](https://github.com/cds-snc/platform-forms-client/commit/c361d935498cef16cd4adc582eb48ac607efc1c4))

## [3.2.0](https://github.com/cds-snc/platform-forms-client/compare/v3.1.1...v3.2.0) (2023-08-03)


### Features

* Alarm on privilege escalation ([#2433](https://github.com/cds-snc/platform-forms-client/issues/2433)) ([0ef16f9](https://github.com/cds-snc/platform-forms-client/commit/0ef16f93aa28609445de65ecc25964cc3f02c309))
* deactivate user account ([#2281](https://github.com/cds-snc/platform-forms-client/issues/2281)) ([0698f44](https://github.com/cds-snc/platform-forms-client/commit/0698f448e8827bd42f218bcf233293599eeb50ad))
* Delete test responses on publish ([#2367](https://github.com/cds-snc/platform-forms-client/issues/2367)) ([08d91bf](https://github.com/cds-snc/platform-forms-client/commit/08d91bf13ea942d9a3a4d826e225fab2729169e2))
* don't trigger gta event on preview submissions ([#2400](https://github.com/cds-snc/platform-forms-client/issues/2400)) ([c0f3e8c](https://github.com/cds-snc/platform-forms-client/commit/c0f3e8c3f3ec0815fa7d0d2a3d9591175097ddd3))
* remove test/preview for published forms ([#2422](https://github.com/cds-snc/platform-forms-client/issues/2422)) ([294da5b](https://github.com/cds-snc/platform-forms-client/commit/294da5bcac4404e848f9f1363428df75866de746))


### Bug Fixes

* **deps:** update all patch dependencies ([#2407](https://github.com/cds-snc/platform-forms-client/issues/2407)) ([3694aa4](https://github.com/cds-snc/platform-forms-client/commit/3694aa4aa848ed0671caf3abf62cd25356465bf5))
* error handling for 2FAExpiredSession ([#2491](https://github.com/cds-snc/platform-forms-client/issues/2491)) ([e066bc1](https://github.com/cds-snc/platform-forms-client/commit/e066bc133d61e47a950aad7117f1c685dd2f6c98))
* form name not being set when title is set ([#2292](https://github.com/cds-snc/platform-forms-client/issues/2292)) ([f9acfa9](https://github.com/cds-snc/platform-forms-client/commit/f9acfa92024630d6e86ef0df529aedc330e26ad1))
* update audit logs to be more unique ([#2430](https://github.com/cds-snc/platform-forms-client/issues/2430)) ([f0804fa](https://github.com/cds-snc/platform-forms-client/commit/f0804fa166e281483f7217b05018ea80fccc31de))


### Documentation

* add info about local testing ([#2309](https://github.com/cds-snc/platform-forms-client/issues/2309)) ([7598ef2](https://github.com/cds-snc/platform-forms-client/commit/7598ef2b4f61c01942e46b248d821248ae4f76c9))
* update testing info ([#2327](https://github.com/cds-snc/platform-forms-client/issues/2327)) ([4969a8b](https://github.com/cds-snc/platform-forms-client/commit/4969a8b314a5cb25859fc6f484c317f592b59696))


### Miscellaneous Chores

* add tailwindcss eslint config ([888d6ee](https://github.com/cds-snc/platform-forms-client/commit/888d6eee2eab3e0141977de729a053ead7867100))
* **deps:** update all non-major docker images ([#2332](https://github.com/cds-snc/platform-forms-client/issues/2332)) ([c880147](https://github.com/cds-snc/platform-forms-client/commit/c88014779b565d83a7db16d558425ea1dcc52fd9))
* **deps:** update all non-major github action dependencies ([#2331](https://github.com/cds-snc/platform-forms-client/issues/2331)) ([43e0be7](https://github.com/cds-snc/platform-forms-client/commit/43e0be7a96156dea0d2461308be55d8f42e216a0))
* **deps:** update all patch dependencies ([#2297](https://github.com/cds-snc/platform-forms-client/issues/2297)) ([f66a772](https://github.com/cds-snc/platform-forms-client/commit/f66a77267b28d962592fe27894dc7ff0868871b9))
* fix contact us links for published page ([#2454](https://github.com/cds-snc/platform-forms-client/issues/2454)) ([aac5d5e](https://github.com/cds-snc/platform-forms-client/commit/aac5d5e8345fbf5cbe8ab006410f087590fbbb7c))
* refactor delete responses on publish ([#2431](https://github.com/cds-snc/platform-forms-client/issues/2431)) ([3428012](https://github.com/cds-snc/platform-forms-client/commit/3428012599bd1eb5b30313bec2b213a8cbee6a50))
* removed unused variable in DownloadTable.tsx ([#2474](https://github.com/cds-snc/platform-forms-client/issues/2474)) ([244b1a9](https://github.com/cds-snc/platform-forms-client/commit/244b1a917ff1d4a1f227026e88b0f165f670d204))
* Terms of use typo and formatting ([fb4ddd7](https://github.com/cds-snc/platform-forms-client/commit/fb4ddd7c57b48f95de21d1bb56203922793f4415))
* Update branding options ([#2449](https://github.com/cds-snc/platform-forms-client/issues/2449)) ([8fc26ec](https://github.com/cds-snc/platform-forms-client/commit/8fc26ecaf83d061217a517ba793e9fb80b84c58c))
* update debug config ([#2404](https://github.com/cds-snc/platform-forms-client/issues/2404)) ([a173a88](https://github.com/cds-snc/platform-forms-client/commit/a173a888ccbec794aec339c5882c6190e53c205a))
* update user table + add  migrations for upcoming feature ([#2310](https://github.com/cds-snc/platform-forms-client/issues/2310)) ([2d1149f](https://github.com/cds-snc/platform-forms-client/commit/2d1149fa590daa9d518485b138cad3b0a0777f7c))

## [3.1.1](https://github.com/cds-snc/platform-forms-client/compare/v3.1.0...v3.1.1) (2023-06-19)


### Miscellaneous Chores

* **deps:** lock file maintenance ([#2298](https://github.com/cds-snc/platform-forms-client/issues/2298)) ([78b36c6](https://github.com/cds-snc/platform-forms-client/commit/78b36c624ad98d6410fb2bcf10d6b5754f1d9250))

## [3.1.0](https://github.com/cds-snc/platform-forms-client/compare/v3.0.12...v3.1.0) (2023-06-19)


### Features

* 2FA Authentication through Email ([#2133](https://github.com/cds-snc/platform-forms-client/issues/2133)) ([2cc568d](https://github.com/cds-snc/platform-forms-client/commit/2cc568d7b2a7c6a4dd7748c09748ddd9441b90f8))
* add Dockerfile to create Lambda PR review env ([#2221](https://github.com/cds-snc/platform-forms-client/issues/2221)) ([b15e19b](https://github.com/cds-snc/platform-forms-client/commit/b15e19b9a27aa5bf4a712e6d4087e6da0950cd74))
* workflow to sync PR review env vars ([#2282](https://github.com/cds-snc/platform-forms-client/issues/2282)) ([d27618b](https://github.com/cds-snc/platform-forms-client/commit/d27618bd72a94a5a8c1324433f0c4e119ded4fc3))
* workflows for PR Review environment ([#2243](https://github.com/cds-snc/platform-forms-client/issues/2243)) ([bc318e9](https://github.com/cds-snc/platform-forms-client/commit/bc318e972b72b0832c7030300d1f3d0138fe12de))


### Bug Fixes

* 2fa string updates ([#2265](https://github.com/cds-snc/platform-forms-client/issues/2265)) ([fdab140](https://github.com/cds-snc/platform-forms-client/commit/fdab1401b43d88d3d1bf26a15953cc4cff6b48c6))
* a11y misc ([1661da3](https://github.com/cds-snc/platform-forms-client/commit/1661da357f4dcef4ab5015ca9bd6eb46bf642320))
* add 2fa locked screen ([#2280](https://github.com/cds-snc/platform-forms-client/issues/2280)) ([b949797](https://github.com/cds-snc/platform-forms-client/commit/b9497971198a07dbb5077cc428dbba65f0626026))
* convert email address to lowercase before any Cognito API request ([#2276](https://github.com/cds-snc/platform-forms-client/issues/2276)) ([bfd6427](https://github.com/cds-snc/platform-forms-client/commit/bfd64273d8c52d779a400512762175c20394cbb1))
* cypress acceptable use page test ([#2239](https://github.com/cds-snc/platform-forms-client/issues/2239)) ([83b04e2](https://github.com/cds-snc/platform-forms-client/commit/83b04e2f526834dd998f750b7af2ed7296e31278))
* give focus to alert for create account and verify screens ([#2263](https://github.com/cds-snc/platform-forms-client/issues/2263)) ([424da5c](https://github.com/cds-snc/platform-forms-client/commit/424da5cd4cb3fe3a02c48f136bc9abaf8619dcdd))
* local devcontainer setup ([#2238](https://github.com/cds-snc/platform-forms-client/issues/2238)) ([e317299](https://github.com/cds-snc/platform-forms-client/commit/e317299346b3bcbe525465b9d1dd9f658c8dcf50))
* manually handle logout redirect for PR Review environments ([#2285](https://github.com/cds-snc/platform-forms-client/issues/2285)) ([ca6cd17](https://github.com/cds-snc/platform-forms-client/commit/ca6cd1791c5208fc94fd81f8ceea7a9f99c58899))
* remove AWS cli output for PR review envs ([#2286](https://github.com/cds-snc/platform-forms-client/issues/2286)) ([a6d4504](https://github.com/cds-snc/platform-forms-client/commit/a6d4504f466f573e88d336cbc4078b6d8048697b))
* update content to use security code vs verification code ([#2267](https://github.com/cds-snc/platform-forms-client/issues/2267)) ([fbda229](https://github.com/cds-snc/platform-forms-client/commit/fbda22920586cd7233424693a4763a89b76d34e3))


### Code Refactoring

* improve Prisma/Cognito user email migration code to handle failures gracefully ([#2293](https://github.com/cds-snc/platform-forms-client/issues/2293)) ([984ff60](https://github.com/cds-snc/platform-forms-client/commit/984ff60fe80555ea79ccca541ae1e6f90cf687a9))
* review Cognito/2FA thrown errors ([#2266](https://github.com/cds-snc/platform-forms-client/issues/2266)) ([88b0651](https://github.com/cds-snc/platform-forms-client/commit/88b0651499daf1a5a7be4b1abe15a72d93a0cdd3))


### Miscellaneous Chores

* **deps:** update all non-major docker images ([#2295](https://github.com/cds-snc/platform-forms-client/issues/2295)) ([b364f0d](https://github.com/cds-snc/platform-forms-client/commit/b364f0d31e1d6eeb1f17f2f30e51630e30a7e9d2))
* **deps:** update all non-major github action dependencies ([#2296](https://github.com/cds-snc/platform-forms-client/issues/2296)) ([8baf049](https://github.com/cds-snc/platform-forms-client/commit/8baf049dc5e685c0beb31c76fb7a858fa593514c))
* remove /admin/login page ([#2257](https://github.com/cds-snc/platform-forms-client/issues/2257)) ([2cb72df](https://github.com/cds-snc/platform-forms-client/commit/2cb72dff962fe182325a76b9941a237855a2e8ae))
* remove workflow trigger ([#2283](https://github.com/cds-snc/platform-forms-client/issues/2283)) ([6cd931b](https://github.com/cds-snc/platform-forms-client/commit/6cd931b00e11830d686253184175bef83333155f))

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
