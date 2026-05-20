# Changelog

## [2.2.10] - 2026-05-15

- Adds toast background override to /src/styles/_toast.scss

## [2.2.9] - 2026-05-11

- Remove residual i18next dependency from package

## [2.2.8] - 2026-05-11

- Remove i18next as a dependency from validation types. Introduced a local TranslateFn type for translation function signatures in validation. This keeps the core package framework-agnostic and avoids unnecessary dependencies.

## [2.2.7] - 2026-05-04

- Support for new Advanced number input validation

## [2.2.6] - 2026-05-04

- Update vitest to ^4.1.5 for latest features and improvements

## [2.2.5] - 2026-04-30

- Modify import

## [2.2.4] - 2026-04-28

- Add 'recheck' package to the list of dependencies

## [2.2.3] - 2026-04-01

- Move regex validation utils into package

## [2.2.2] - 2026-03-30

- Enable Custom Regex validation

## [2.2.1] - 2026-03-31

- Fix shared toast status styling after the Tailwind CSS v4 update by preserving React Toastify root classes and restoring toast background colors.

## [2.2.0] - 2026-03-27

- Update shared styles for Tailwind CSS v4 compatibility.
- Replace `theme()` calls with CSS custom properties in SCSS sources.
- Replace `@apply` with plain CSS where Sass can't parse TW v4 `!` prefix syntax.
- Replace `bg-center-right-15px` custom utility with plain CSS `background-position`.
- Sass-only build pipeline preserved (`build-styles.mjs`).
- Tailwind preset (`tailwind-preset.js`) still ships for v3 consumer apps.

## [2.1.0] - 2026-03-06

- Add shared style exports for forms, gc-header, typography, and toast.
- Add a shared Tailwind preset for consumer apps.

## [2.0.3] - 2025-12-18

- Trim whitespace when validating text input

## [2.0.2] - 2025-12-16

- Fix infinite recursion bug in visibility check and add unit test coverage

## [2.0.1] - 2025-11-12

- Remove `.xml` and `.svg` file type support

## [2.0.0] - 2025-11-05

- Updates valueMatchesType to be more inline with `isFieldResponseValid` returns a t(string).

- Adds valueMatches return <Boolean> use in place of `isFieldResponseValid` where a <Boolean> is needed.

## [1.0.11] - 2025-10-29

- Remove `.numbers` file type support

## [1.0.10] - 2025-10-28

- Add values-to-types and isValidEmail

## [1.0.9] - 2025-10-27

- Add exports field to package.json

## [1.0.8] - 2025-10-01

- Bump yarn


## [1.0.7] - 2025-09-09

- Bump yarn

## [1.0.6] - 2025-09-09

- export validateVisibleElements

## [1.0.4] - 2025-08-29

- Fix build step

## [1.0.3] - 2025-08-25

- Update to add more helpers

## [1.0.1] - 2025-08-15

- Update file validation and added file-type as a dependancy
- Add tsdown + build


### Changed

- Setup package for common standalone functions

## [1.0.0] - 2025-08-12

### Changed

- Setup package for common standalone functions
