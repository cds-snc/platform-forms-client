# Working Draft Handoff Summary

## Goal

Change the published-form edit flow so editing a published form creates or reuses a linked working draft, while the live published form stays available until republish.

## Core Design Implemented

- Added a self-referential link on `Template` using `sourceTemplateId`.
- Editing a published form now targets a separate draft working copy instead of unpublishing the live form.
- Republishing a working copy merges the working copy back into the original published template so the public form ID remains stable.
- Republish is blocked until responses awaiting confirmation are cleared.

## Main Backend Changes

### Schema

- Added `Template.sourceTemplateId` self-relation in [prisma/schema.prisma](/Users/tim.arney/projects/platform-forms-client/prisma/schema.prisma).
- Added migration in [prisma/migrations/20260320153000_add_template_working_copy_link/migration.sql](/Users/tim.arney/projects/platform-forms-client/prisma/migrations/20260320153000_add_template_working_copy_link/migration.sql).

### Working-copy lifecycle

- Working-copy creation logic lives in [lib/templates.ts](/Users/tim.arney/projects/platform-forms-client/lib/templates.ts).
- Entry point: `createWorkingCopyForPublishedTemplate(formID, locale)`.
- Publish/republish logic lives in `updateIsPublishedForTemplate()` in the same file.
- Responses awaiting confirmation helper lives in [lib/vault.ts](/Users/tim.arney/projects/platform-forms-client/lib/vault.ts).

### Important runtime fix

The repo has a Prisma template query extension in [lib/integration/prismaConnector.ts](/Users/tim.arney/projects/platform-forms-client/lib/integration/prismaConnector.ts) that injects `ttl: null` into template queries.

That caused a bug:

- archived linked working copies were invisible to normal template queries
- a stale archived working copy could still hold the unique `sourceTemplateId`
- clicking `Edit published` could fail with a Prisma unique constraint error on `sourceTemplateId`

Current fix:

- stale archived linked working copies are cleared in [lib/templates.ts](/Users/tim.arney/projects/platform-forms-client/lib/templates.ts) using raw SQL via `prisma.$executeRaw`
- this bypasses the repo-wide `ttl: null` filter only for this cleanup path

## Main UI Changes

### Edit published flow

- [app/(gcforms)/[locale]/(form administration)/form-builder/[id]/published/components/StartEditingPublishedFormButton.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/form-builder/%5Bid%5D/published/components/StartEditingPublishedFormButton.tsx)
  - now creates or reuses a working copy

- [app/(gcforms)/[locale]/(form administration)/form-builder/actions.ts](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/form-builder/actions.ts)
  - added server action wrapper for working-copy creation
  - revalidates the forms list after creating a working copy

### Publish / republish flow

- [app/(gcforms)/[locale]/(form administration)/form-builder/[id]/publish/page.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/form-builder/%5Bid%5D/publish/page.tsx)
- [app/(gcforms)/[locale]/(form administration)/form-builder/[id]/publish/components/Publish.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/form-builder/%5Bid%5D/publish/components/Publish.tsx)
- [app/(gcforms)/[locale]/(form administration)/form-builder/[id]/publish/components/PublishCard.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/form-builder/%5Bid%5D/publish/components/PublishCard.tsx)
- [app/(gcforms)/[locale]/(form administration)/form-builder/[id]/publish/components/TakeLiveFormOfflineButton.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/form-builder/%5Bid%5D/publish/components/TakeLiveFormOfflineButton.tsx)

Implemented behavior:

- blocks republish when source live form has responses awaiting confirmation
- blocks republish when working copy itself has responses awaiting confirmation
- lets user take live form offline before republish
- hides generic publish warning in blocked republish states

### Public form route

- [app/(gcforms)/[locale]/(form filler)/id/[...props]/page.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20filler)/id/%5B...props%5D/page.tsx)

Behavior:

- previously-published offline forms render maintenance/offline behavior explicitly

### Forms list visibility

- [app/(gcforms)/[locale]/(form administration)/forms/page.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/forms/page.tsx)
- [app/(gcforms)/[locale]/(form administration)/forms/components/server/Card.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/forms/components/server/Card.tsx)

Current behavior:

- the forms list query includes linked working-draft metadata
- a `Working draft in progress` badge can render on:
  - the published source form card when it has a linked draft
  - the draft working-copy card when it is linked back to a published source form

## Translation Changes

- [i18n/translations/en/form-builder.json](/Users/tim.arney/projects/platform-forms-client/i18n/translations/en/form-builder.json)
- [i18n/translations/fr/form-builder.json](/Users/tim.arney/projects/platform-forms-client/i18n/translations/fr/form-builder.json)
- [i18n/translations/en/my-forms.json](/Users/tim.arney/projects/platform-forms-client/i18n/translations/en/my-forms.json)
- [i18n/translations/fr/my-forms.json](/Users/tim.arney/projects/platform-forms-client/i18n/translations/fr/my-forms.json)

## Tests

Primary test file:

- [lib/tests/templates.test.ts](/Users/tim.arney/projects/platform-forms-client/lib/tests/templates.test.ts)

Validated scenarios include:

- create a draft working copy for a published form
- clear stale archived linked working copies
- recover from working-copy create races
- republish working copy back into source form
- block republish when responses await confirmation

Most recent targeted validation:

```bash
yarn jest lib/tests/templates.test.ts --runInBand
```

Result at handoff:

- 35 tests passed

## Live Runtime State Checked During Debugging

For published form:

- `cmmyx93nl000snbsk15h2r5ob`

Direct database inspection showed an active working copy exists:

- source form: `cmmyx93nl000snbsk15h2r5ob`
- working copy: `cmmyxlkl3001cnbskjgi2t5yr`

Observed DB state at the time of inspection:

- source template is published and not archived
- working copy is draft and not archived
- `workingCopy` relation on the source template resolves correctly

## Latest User-Reported Issues

The last reported issues before pausing were:

- a working draft existed in the database but was not obvious in `/en/forms`
- `Edit published` had previously failed with `There was an error opening the draft working copy for this form`

The stale archived unique-link cause was fixed. The active working copy for `cmmyx93nl000snbsk15h2r5ob` was confirmed in the database.

## Best Next Checks When Resuming

1. Open `/en/forms` and verify whether the badge is visible for either:
   - the published card for `cmmyx93nl000snbsk15h2r5ob`
   - the draft card for `cmmyxlkl3001cnbskjgi2t5yr`
2. Click `Edit published` on `cmmyx93nl000snbsk15h2r5ob` and confirm it routes to the existing draft `cmmyxlkl3001cnbskjgi2t5yr`.
3. If the draft exists but the badge still does not show, inspect the server-rendered forms list data from `getAllTemplatesForUser()` and page mapping in [app/(gcforms)/[locale]/(form administration)/forms/page.tsx](/Users/tim.arney/projects/platform-forms-client/app/(gcforms)/%5Blocale%5D/(form%20administration)/forms/page.tsx).
4. If `Edit published` still errors, inspect the exact Prisma exception in `createWorkingCopyForPublishedTemplate()` in [lib/templates.ts](/Users/tim.arney/projects/platform-forms-client/lib/templates.ts).

## Open Nice-to-Have

Not started yet:

- republish diff view using `superdiff`
