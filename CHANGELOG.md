# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
