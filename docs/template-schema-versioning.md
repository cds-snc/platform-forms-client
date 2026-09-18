# Template Schema Versioning

Status: **Design agreed, implementation not started.**

This doc tracks the plan and decisions for versioning the shape of a form
template's `jsonConfig` (validated against
[templates.schema.json](../lib/middleware/schemas/templates.schema.json)), and
is updated as we implement.

## Nomenclature note

There are two unrelated things both called "version" in this codebase:

- **`TemplateVersion`** (Prisma model) — publish/draft history of a `Template`
  record (`currentPublishedVersion`, `currentDraftVersion`, etc).
- **Template schema version** (this doc) — the shape/structure of the
  `jsonConfig` blob itself, i.e. which revision of `templates.schema.json` and
  our internal `FormProperties` type a given template was authored against.

This doc is only about the second one.

## Problem

- We have no way to know what shape a given template's `jsonConfig` is in.
- Over the years, bugs and inconsistent authoring have produced templates with
  broken/inconsistent structure (missing element `uuid`s, dangling
  `conditionalRules` references, orphaned elements not in any group, stale
  `textField` + `validation.type: "number"` instead of `numberInput`, etc).
- Today these are patched by unconditional "clean on every load/mutation"
  transforms in
  [transformFormProperties.ts](../lib/store/helpers/elements/transformFormProperties.ts)
  (`cleanFormStructure`, `cleanElements`). These run on **every** template,
  **every** time, forever — there's no signal for whether a given transform is
  still needed anywhere, so none of them can ever be safely deleted.
- We want to move toward a stricter schema that's enforced at write time, with
  a real mechanism for evolving the schema and migrating old data instead of
  perpetually defending against it at read time.

## Goals

- Add a `version` field to templates so we know what shape a template is in.
- Provide a migration mechanism to bring old templates up to the current shape
  in a controlled, one-time way (not a standing tax on every load).
- Let genuinely structural schema changes become discrete, deletable migration
  steps instead of permanent defensive code.
- Push toward rejecting invalid states at write time in the builder, rather
  than silently repairing them at read time.

## Non-goals / explicit constraints

- **Published templates are never migrated.** `currentPublishedVersion.jsonConfig`
  is treated as frozen/working-as-shipped. The public render/submission path
  ([getPublicTemplateByID.ts](../lib/templates/queries/getPublicTemplateByID.ts))
  must never run migrations. Consequence: public rendering code must remain
  permanently tolerant of every historical schema shape that could still be
  live/published — this work does not remove that need, it only stops it from
  growing for *builder-side* handling.
- This is not an attempt to retroactively fix all historical data in one pass.

## Design

### `version` property

- Add `version` (integer) to `templates.schema.json`.
- Missing `version` is treated as implicit version `1` — this is not a special
  case, it's just `template.version ?? 1` wherever version is read.
- "Introducing the `version` field" is itself framed as the first migration
  step (undefined/1 → 2), not a one-off normalization bolted onto the runner.

### Migration chain

- `migrations` is an ordered map/chain: `migrations[N]` transforms a template
  from version `N` to `N + 1`.
- A runner applies `migrations[currentVersion]`, `migrations[currentVersion+1]`,
  ... sequentially until the template reaches `CURRENT_VERSION`, stamping
  `version` at each step.
- Once migrated and persisted, a template never needs to be migrated again for
  that step — this is the key difference from today's unconditional transforms.
- Each migration should be a small, pure function with its own unit test.

### Where migrations run

| Path | Migrates? |
|---|---|
| Public render/submission (`getPublicTemplateByID`) | **No** — published `jsonConfig` is frozen |
| Form-builder loading a draft for editing | Yes |
| Import into the builder | Yes |
| Creating a new draft from a published template (`createDraftForTemplate.ts`, which copies `currentPublishedVersion.jsonConfig`) | Yes — migrate at copy time, so the new draft starts at `CURRENT_VERSION` |
| Creating a brand-new template from scratch | N/A — stamp `CURRENT_VERSION` directly, no migration needed |

### Splitting `transformFormProperties.ts`

Current transforms fall into two buckets that need to be handled differently:

1. **Structural migrations** — represent an intentional shape change we made
   on purpose (e.g. `updateNumberInputType`: `textField` +
   `validation.type: "number"` → `numberInput`). These become versioned
   migration steps, run once, deletable once no un-migrated templates remain.
2. **Defensive repairs** — paper over states that shouldn't be writable at all
   (`ensureUUID`, dangling `conditionalRules` cleanup, orphaned
   element/layout pruning). These should trend toward becoming **write-time
   rejections** in the builder (reject on save/publish) rather than permanent
   read-time repair. Where we can't fully prevent them yet, they can remain as
   one-off repair migrations tied to the version where the bug existed, not
   blanket logic applied to all data going forward.

The `transform()` store action (in-memory editing-state consistency while a
user is actively editing) is a separate concern from persisted-data migration
and is out of scope here — it stays as-is.

### Existing production data

- All existing `Template.jsonConfig` / `TemplateVersion.jsonConfig` rows
  predate this feature and have no `version` field — they're implicitly
  version 1.
- Migrate-on-read (in the builder-side load path) with write-back of the
  migrated result, rather than a bulk one-time DB migration script. This
  avoids bulk-editing historical `TemplateVersion` rows (an append-only
  history table) and keeps published data untouched.

## Open questions

- Exact mechanism for "write-back" after lazy migration (when a draft is
  loaded and migrated, do we persist immediately, or only on next explicit
  save?).
- How/when we decide a migration is safe to delete (query by `version` across
  drafts; published versions below the threshold are expected to persist
  indefinitely and are not a blocker for deleting *builder-side* migration
  code, only for deleting *rendering* tolerance).
- Full inventory/classification of every transform currently in
  `transformFormProperties.ts` into migration vs. schema-tightening buckets.
- **`getSchemaFromState` hardcodes its exported field list instead of
  deriving it from `templates.schema.json`.** This is the same class of bug
  as the `version`-dropped-on-download issue: a hand-maintained allowlist
  drifting from its source of truth, just one layer up (schema vs. allowlist,
  rather than `state.form` vs. allowlist). Deriving the allowlist from
  `Object.keys(templatesSchema.properties)` would mean future schema
  properties flow through the export automatically. Complications to work
  out before doing this:
  - The function isn't a pure field copy — it also derives `form.layout` from
    `groups` when `formHasGroups(form)` is true, so a schema-driven rewrite
    needs to keep that transform separate from "which fields are allowed."
  - `securityAttribute` is currently in the exported allowlist but is **not**
    a property in `templates.schema.json`. Need to double check: this
    property may have moved from the template `jsonConfig` to the database
    (`Template.securityAttribute` in `schema.prisma`) at some point, and its
    presence in `getSchemaFromState`'s export could just be leftover cruft
    that should be removed rather than something to add to the schema.
    Needs review before deciding whether the schema or the export function
    is wrong.
  - Lower-risk interim option instead of a full refactor: add a contract test
    asserting `Object.keys(templatesSchema.properties)` matches the
    allowlist in `getSchemaFromState`, so any future divergence fails loudly
    instead of silently dropping fields.

## Progress log

- 2026-09-18: Design discussion completed (this doc created). Implementation
  not yet started.
- 2026-09-18: Noted that the current branch (`update-schema-for-groups`, not
  yet merged) is itself a schema change: it tightens `groups`/`groupsLayout`
  validation (requires `start`/`review`/`end`, required group fields,
  `nextAction` shape, `additionalProperties: false`, etc). Decisions:
  - Land the groups PR on its own first; start/rebase the versioning work
    against `main` after it merges, rather than stacking long-term or racing
    to merge versioning first. Versioning needs to classify schema changes
    against the final `groups` shape, not a moving target.
  - This groups change is a good concrete test of the migration-vs-repair
    split: already well-formed templates need no data transform, only a
    version stamp. Templates that are currently malformed relative to the
    implicit structure (missing `start`/`review`/`end`, orphaned elements,
    etc.) will now fail validation outright instead of being silently
    tolerated — the "migration" for those is a one-time repair (reusing
    existing `initializeGroups`/`cleanFormStructure` logic) gated by version,
    converting today's permanent defensive cleanup into an actual versioned
    migration step.
- 2026-09-18: Started implementation on branch `add-template-schema-versioning`
  (off `main`, ahead of the groups PR merging). First step landed:
  - Added optional `version` (integer) to
    [templates.schema.json](../lib/middleware/schemas/templates.schema.json)
    and `FormProperties` ([form-types.ts](../packages/types/src/form-types.ts)).
  - Added the migration scaffold under `lib/templates/schemaVersioning/`:
    `migrations.ts` (`CURRENT_TEMPLATE_VERSION`, empty `migrations` map) and
    `migrateTemplate.ts` (`getTemplateVersion` — missing version treated as 1
    — and `migrateTemplate`, which applies registered migrations in sequence
    and stamps the resulting version). Covered by
    `migrateTemplate.test.ts`.
  - `CURRENT_TEMPLATE_VERSION` is `1` and `migrations` is empty for now —
    there's no real structural change to migrate yet on `main`. The first
    real migration (and a version bump to `2`) lands with the groups PR's
    repair-migration once that work is rebased in.
  - Not yet wired into any load/import/draft-creation path — that's next,
    once there's an actual migration to run.
- 2026-09-18: Restructured `migrations.ts` into a `migrations/` folder
  (`index.ts` for `CURRENT_TEMPLATE_VERSION` + the registry map, `types.ts`
  for `TemplateMigration`) so individual migrations can each get their own
  file (e.g. `migrations/1-to-2.ts`) as they accumulate, instead of one
  ever-growing file.
- 2026-09-18: Added the first real migration, `migrations/1-to-2.ts`
  (`migrateFrom1To2`): stamps an explicit `version: 2`, no other change. This
  is "introducing the version field" as a migration in its own right, per the
  earlier design decision — it doesn't depend on the groups PR.
  `CURRENT_TEMPLATE_VERSION` is now `2` and registered in `migrations/index.ts`.
- 2026-09-18: Wired `migrateTemplate` into the builder-side load/import paths
  (confirmed via usage search that `TemplateStoreProvider`/`useTemplateStore`
  is exclusively used under the form-builder routes, never the public
  form-viewer):
  - `initialize.ts` (brand new template): stamps `CURRENT_TEMPLATE_VERSION`
    directly, no migration — there's nothing to migrate for a fresh form.
  - `initStore.ts` (SSR initial builder state when opening an existing
    template's draft): migrates `initProps.form` before merging with
    `defaultForm`.
  - `setFromRecord.ts` (re-syncing the store from a server record, e.g. after
    edit-lock changes): migrates `record.form` before merging with
    `defaultForm`.
  - `importTemplate.ts` (store action that loads the file-upload import
    buffer): migrates the incoming `jsonConfig` before merging with
    `defaultForm`.
  - `Start.tsx` (file import UI): migrates right after the existing
    `transformFormProperties` cleanup and before `validateTemplate`, so
    imported templates are validated against the current schema shape.
  - `createDraftForTemplate.ts` (server-side, copies
    `currentPublishedVersion.jsonConfig` into a new draft
    `TemplateVersion` row): migrates the copied JSON before it's persisted as
    the new draft. `currentPublishedVersion.jsonConfig` itself is never
    touched.
  - Important ordering note: in every merge-with-`defaultForm` call site,
    migration runs on the *raw* incoming data first, then the result is
    spread over `defaultForm`. `defaultForm` intentionally does not carry a
    `version` field — if it did, the `{...defaultForm, ...incoming}` merge
    pattern used to backfill missing fields on old templates would silently
    stamp the current version on old data without actually migrating it,
    defeating the "missing version means version 1" detection.
  - Not yet done: public render/submission path is untouched (correct — it
    must never migrate); no dedicated test added for
    `createDraftForTemplate.ts` (pre-existing gap, not introduced by this
    change).
- 2026-09-18: Bug found via manual testing (new template and imported
  template both lost `version` on download while not logged in). Root cause:
  `getSchemaFromState` (`lib/utils/form-builder/index.ts`), used by the
  builder's JSON download/export (`DownloadFileButton.tsx` → `getSchema()`),
  manually destructures a fixed allowlist of fields off `state.form` rather
  than spreading it — any field not explicitly named is silently dropped from
  the exported JSON, including `version`. Fixed by adding `version` to the
  destructure and the reconstructed object. Added
  `getSchemaFromState.test.ts` (no prior test coverage existed for this
  function). This is a good reminder to audit for other manual
  allowlist/reconstruction of `FormProperties` that could similarly drop new
  fields (e.g. save/publish paths) as this work continues.
- 2026-09-18: Follow-up discussion on the `getSchemaFromState` fix — logged
  as an open question above: should its exported field list be derived from
  `templates.schema.json` instead of hardcoded, and what to do about
  `securityAttribute` (currently exported but not in the schema — possibly
  leftover from before it moved to the `Template` DB column, needs review).
