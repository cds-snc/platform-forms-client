# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Use a cache to fill frequent requests to the Template API to reduce overall load on Lambdas

### Changed

- Remove unused debugging `console.logs()`
- Remove info level logging from production builds

### Fixed

- When Feature 'Submit to Reliability Queue' is off do not treat the submission as an Error.

### Removed

- Temporary routing for existing form Ids to newly assigned Ids.

## [1.0.0] 2021-06-24

#### ⚠️ This release includes a data migration

#### 🚩 This release includes features hidden behind feature flags

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
