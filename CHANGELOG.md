# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Fixed

- Top left corner logo is now more accessible as it tells the user that clicking on it will get him back to the home page
- Harmonized RichText and Checkbox/Radio label max width depending on screen ratio.

## [1.0.2] 2021-09-21

### Fixed

- Phone number input component was not WCAG compliant.

## [1.0.1] 2021-09-16

### Added

- Use a cache to fill frequent requests to the Template API to reduce overall load on Lambdas
- Enable support for development using local Lambdas
- Enable support for organisations and organisation management through the admin panel
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
