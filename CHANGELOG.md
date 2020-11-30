# Changelog
All notable changes to this product will be documented in this file.

## 2020-06-29

### Bugfix
* Fixed a problem where pages would fail to load multiple javascript files

## 2020-06-26

### Added
* Instructions on how to return to the application from the feedback submission (error and thanks) pages. These pages are only available when Javascript is disabled
* The back button on the feedback submission pages now returns you to the page where you submitted the feedback

## 2020-06-23

### Changed
* Feedback form now saves data to Adobe Analytics

## 2020-06-17

### Removed
* A duplicate back button has been removed from the results page

## 2020-06-16

### Removed
* Google Analytics

### Changed
* Modifed Your province or territory page to use a auto-complete dropdown isntead of radio buttons
* Modified Back button implementation to use a history stored in the session to enable navigation with no javascript
* CERB duration is now 24 weeks, up from 16

## 2020-06-12

### Added
* Feature Flag for Freetext on Feedback

## 2020-06-10

### Added
* The Disability Tax Credit
* Feature flag for DTC

### Bugfix: 
* Fixing HTML Validation Errors

## 2020-06-04

### Added 
* Tracking when users click on the button to view the not-relevant benefits.
* Added Date for sending payments to seniors

## 2020-06-03

### Changed:
* Updated static asset version number to match app version number

## 2020-06-02

### Added:
* Added error messages informing a user not to submit empty feedback forms

## 2020-06-01

### Fixed:
* Added French text for Non-Matching Results Header on Results Page

### Changed: 
* Modified content on start page
* Modified content on results page

## 2020-05-29

### Added:
* Added new option on feedback form "You don't know where to go for help."
* Added warning on start page if cookies are disabled

## 2020-05-28

### Changed:
* Added none of the above to *No Income*, *Some Income*, and *Unchanged Income* questions.
* Redesigned Results screen that displays benefits that we know about, but you weren't eligible for, with accordion expand/collapse sections

### Added:
* Custom i18n module for client-side access to locale files

### Removed:
* Removed the ei_regular_cerb and ei_sickness_cerb cards and updated the calculations/tests

## 2020-05-22

### Changed:
* OAS question now includes options for people receiving the Allowance or Allowance for the Survivor  
* OAS result now includes one-time payment information for people receiving the Allowance or Allowance for the Survivor 
* Changed OAS result payment to be "as soon as possible" for alignment with the program page 

## 2020-05-20

### Added: 
* [NEW BENEFIT] Links to provincial and territorial benefits

## 2020-05-17

### Changed: 
* Government of Canada logo redirects to canada.ca 
* Meta title, description, and images for better social media sharing 

## 2020-05-15

### Added: 
* Added a link to the business benefits finder from the start page
* Created vanity urls that redirect to the product:
  * canada.ca/coronavirus-benefits
  * canada.ca/coronavirus-prestations 

### Changed: 
* Modified text on start button from "Start now" to "Find help" 

### Removed: 
* Removed link to Canadians stuck abroad on the start page 

## 2020-05-14

### Added
 * [NEW BENEFIT] One-time payments for OAS and GIS recipients
 * [NEW BENEFIT] Canada Emergency Student Benefit (CESB)

## 2020-05-11 - Initial launch 

### Added 
* Benefits:
  * Canada Emergency Response Benefit
  * Work-Sharing
  * Mortgage support
  * Provincial help for renters
  * Suspending repayment and interest on student and apprentice loans
  * Canada Child Benefit
  * Reduced minimum withdrawals for Registered Retirement Income Funds
  * Financial aid for 2021 school year
  * GST tax credit
