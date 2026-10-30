# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-27

- Add message coordinator, scheduler and update how package is exported
- replace old hook api with more streamlined `useAnnounce()` hook
- Preserve request language through shared live regions with an optional `lang`
  option, including language-aware duplicate handling and bilingual combobox feedback.
- Register hosts before passive effects so mount-effect announcements are retained
  when hosts remount or reactivate.

## [1.0.5] - 2026-06-11

- Add announce Priority to exports

## [1.0.4] - 2026-03-26

- Add useAllowDuplicateAnnouncer

## [1.0.3] - 2025-12-29

- Complete Enum Removal

## [1.0.2] - 2025-10-01

- Bump yarn

## [1.0.1] - 2025-09-09

- Bump yarn

## [1.0.0] - 2025-04-17

- Create announce package
