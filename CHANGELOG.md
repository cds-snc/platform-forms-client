# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Send email through GC Notify when a new temporary token is generated
- A UI with tabs on the Form Settings page. [#486](https://github.com/cds-snc/platform-forms-client/pull/573)
- A tab on the Form Settings page that allows the user to see and refresh the bearer token.

### Changed

- Renamed `organisation` to `organization` which has an impact on the API access path

### Fixed

- Google Tag manager iframe will no longer appear in other environment other then staging. [#563](https://github.com/cds-snc/platform-forms-client/pull/563)
- Form configuration upload now correctly displays the updated configuration instead of displaying old values. [#579](https://github.com/cds-snc/platform-forms-client/pull/597)
- Clicking a link clears the form. [#498](https://github.com/cds-snc/platform-forms-client/issues/498)

## [1.0.4] 2021-12-3

### Added

- Add language of form submission to the Next JS submission API and lambda through the `Content-Language` HTTP header
- Add error messages for all elements within dynamic rows. [#520](https://github.com/cds-snc/platform-forms-client/pull/520)
- POST method to /id/[form]/bearer that allows the refreshing of bearer tokens
- `<br>` in long description string now create new lines [#541](https://github.com/cds-snc/platform-forms-client/pull/541)

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

### Fixed

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

### Added

- Added secure API to retrieve bearer token.
- Create secure API to retrieve list of emails associated with a form.
- Create secure API to deactivate a form owner associated with a form
- Create secure API to associate emails to a specific form.
