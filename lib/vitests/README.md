# Migration Guide: Transitioning from Jest to Vitest

This guide provides step-by-step instructions for migrating your test suite from Jest to Vitest, highlighting key differences and helpful tips.

## Step 1: Enable Vitest and Set Globals as Default (This is already set up for this project.)

- Follow the changes outlined in [this pull request](https://github.com/cds-snc/platform-forms-client/pull/3520) to enable Vitest in your project.
- After installing Vitest, ensure that global objects like `describe`, `test`, and `expect` are accessible in your tests by setting Globals as the default scope.

## Step 2: Configure the Test Environment

- Vitest defaults to using `jsdom` as its test environment. If you need to run tests in a different environment (like Node.js), add the following comment to the top of your test file:

  ```javascript
  // @vitest-environment node
  ```

- This override allows you to customize the test environment on a per-file basis.

## Step 3: Understand Known Migration Tips

- Review the [official Vitest migration guide](https://vitest.dev/guide/migration.html#migrating-from-jest) for additional tips and known differences between Jest and Vitest.
- This guide contains valuable information on adapting common Jest patterns to Vitest, along with advice on handling potential issues.

## Step 4: Be Aware of Default Mocking Behavior

- Jest defaults to deep mocking, where dependencies and sub-dependencies are automatically mocked. However, Vitest uses shallow mocking by default.
