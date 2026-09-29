# Form template structure

This document describes the structure and behavior of downloadable form templates, including their elements, groups, navigation, choices, localized content, and visibility rules.

## Template model

A downloadable form template is a JSON document made up of form metadata, elements, and optional branding information.

Templates contain these top-level fields:

- `titleEn`, `titleFr`
- `introduction`
- `privacyPolicy`
- `confirmation`, including optional referrer URLs
- `layout`: ordered element IDs
- `elements`: element definitions
- `groups`: sections and navigation rules
- `groupsLayout`: ordered group IDs
- `brand`
- `lastGeneratedElementId`: editor metadata

The required top-level fields are `titleEn`, `titleFr`, `privacyPolicy`, `confirmation`, `layout`, and `elements`. Non-legacy templates must also include `groups` and `groupsLayout`, even when their values are empty. Legacy templates may omit those two fields. `introduction`, `brand`, and `lastGeneratedElementId` are optional.

## Form structure

### Type reference

Use [`packages/types/src/form-types.ts`](https://github.com/cds-snc/platform-forms-client/blob/main/packages/types/src/form-types.ts) as a reference for the supported shape and property names of `FormProperties`, `FormElement`, `ElementProperties`, `Group`, `NextActionRule`, `ConditionalRule`, `PropertyChoices`, and `ValidationProperties`.

Those TypeScript definitions are a reference, not a complete description of downloadable JSON. They describe possible application values and may mark fields optional for legacy or internal use. The rules in this document describe the downloadable template structure; for example, non-legacy templates still require `groups` and `groupsLayout`, and element or group references must resolve consistently.

### Elements

Persisted element types are:

`textField`, `textArea`, `dropdown`, `radio`, `checkbox`, `fileInput`, `dynamicRow`, `richText`, `attestation`, `combobox`, `addressComplete`, `formattedDate`, `numberInput`, `starRating`

`address`, `name`, `firstMiddleLastName`, `departments`, and `contact` are block-template identifiers, not persisted element types. `customJson` is a loading action, not an element type. A downloadable template contains only the persisted element types listed above.

Each element has:

- `id`: positive integer.
- `type`.
- `properties`: type-specific data.

Common properties include localized titles, descriptions, placeholders, `questionId`, `tags`, `validation`, and `conditionalRules`. Choice-bearing elements may also have `choices`, `managedChoices`, `sortOrder`, and `strictValue` as described below.

Keep the set of downloadable element types explicit and separate from block-template identifiers and actions.

Properties outside the common set are valid only for the element types that use them:

| Element type | Type-specific properties |
| --- | --- |
| `textField` | `autoComplete` when the field needs a specific autocomplete value |
| `dropdown`, `radio`, `checkbox` | `choices` and optional `sortOrder` |
| `combobox` | `managedChoices`, optional `strictValue`, and optional `sortOrder` |
| `fileInput` | `fileType`, the allowed file extension or extensions |
| `dynamicRow` | `subElements`, `maxNumberOfRows`, and localized row and add/remove button text in `dynamicRow` |
| `addressComplete` | `addressComponents`, including address scope and whether the address is split into fields |
| `formattedDate` | `dateFormat` and `autoComplete` |
| `numberInput` | `allowNegativeNumbers`, `stepCount`, `currencyCode`, and `useThousandsSeparator` |
| `richText` | `headingLevel` or `isSectional` only when the element is explicitly defined to use those presentation settings |
| `starRating` | `numberOfStars` |

`full` is not assigned to a persisted element type. It is invalid unless a future element contract defines it. Unknown or type-incompatible properties are invalid; do not apply a property from one element type to another.

### IDs and references

Keep these IDs distinct:

- Element `id` is the positive numeric reference used by `layout`, groups, and rules. It must be unique and resolvable.
- `questionId` is the user-facing and integration-facing key. It must be unique across elements and dynamic-row sub-elements.

### Layout and groups

`layout` is the authoritative global element order. Non-legacy templates include `groups` and `groupsLayout`; each group's `elements` array records membership and repeats the relative order of those members from `layout`, while `groupsLayout` controls only the order of non-locked groups and must not be used to order elements. Legacy templates may omit group structures.

- The set of IDs in `layout` equals the set of top-level element IDs, with each ID appearing exactly once.
- When groups are present, every element in `layout` belongs to exactly one content-bearing group.
- Group element lists contain only existing top-level element IDs and preserve their relative order from `layout`.
- Concatenating `start.elements` and each group listed in `groupsLayout` produces the same element sequence as `layout`.
- `groupsLayout` contains every non-locked group ID exactly once in the intended group order; it contains no element-level ordering information.
- Locked group IDs (`start`, `review`, and `end`) and unknown group IDs are not present in `groupsLayout`.

If `layout` and group membership disagree, the template is structurally invalid. Do not infer one ordering from the other while assessing validity.

### Navigation

A group contains a name, bilingual titles, element IDs, and an optional `nextAction`. Group navigation does not use an element's `conditionalRules`.

A direct `nextAction` is a string naming another group or a permitted reserved destination such as `review`, `end`, or `exit`.

A conditional `nextAction` is an array of navigation rules:

```json
[
  { "groupId": "group-a", "choiceId": "8.0" },
  { "groupId": "group-b", "choiceId": "8.catch-all" }
]
```

Each navigation rule combines a destination `groupId` with a source choice. A concrete `choiceId` uses `<sourceElementId>.<choiceIndex>`. Navigation alone may use `<sourceElementId>.catch-all` as the fallback when no concrete rule matches.

An exit page is a group whose `nextAction` is `"exit"`. It is a terminal page in the form flow, not another group destination. Its `exitUrlEn` and `exitUrlFr` values provide the localized destinations for leaving the form, and both are required when the group exits the form.

Check that:

- Required start, review, and end groups exist when grouped navigation is used.
- `review` points to `end`, and `end` has no outgoing action.
- Every direct target and navigation-rule `groupId` exists or is a permitted reserved destination.
- Every concrete navigation `choiceId` resolves to an existing choice-bearing source element and choice index.
- Every rule in one conditional action uses the same source element.
- Each concrete `choiceId` appears at most once in a conditional action.
- A conditional action has at most one catch-all rule; it is used only when no concrete choice rule matches.
- Every reachable non-exit content group has a path to `review`; no reachable cycle or dead end can trap navigation away from `review`, `end`, or an explicit `exit`.
- Every exit page has both `exitUrlEn` and `exitUrlFr`; an exit page has no outgoing group after `"exit"`.

### Localized content

Requiredness and non-empty rules depend on the enclosing object and element type; an optional description must not be rejected merely because it is empty.

Distinguish:

- Missing required structure.
- Missing optional content objects.
- Present but empty content objects.
- One-language-only values.
- Intentionally empty choices.

For each localized field that is required by the template contract, validate the English and French keys independently. Choice labels and group titles require the same treatment.

### Choices

Choice-based elements include `dropdown`, `radio`, `checkbox`, and related components.

Check that:

- The element type supports choices.
- Inline choice lists contain between 1 and `MAX_CHOICE_AMOUNT` entries, currently 400.
- Every choice has `en` and `fr` string values.
- Values at different indexes do not overlap in either language; choice references depend on the first matching index.
- `managedChoices` is used only by `combobox` and is either a non-empty known data-source key or a non-empty array of unique known keys.
- Inline choices and managed choices are not combined in an unsupported or ambiguous configuration.
- `strictValue` is a boolean used only by `combobox`.
- Choice ordering is `none`, `ascending`, or `descending`.

An inline choice-based question without valid choices is invalid unless its type supports a valid managed-choice source.

### Element visibility rules

Element visibility uses the `properties.conditionalRules` array on the element being controlled. It does not use a group's `nextAction`. Each array item contains one concrete `choiceId`:

```json
{
  "conditionalRules": [
    {
      "choiceId": "2.0"
    },
    {
      "choiceId": "2.1"
    }
  ]
}
```

Here, both rules refer to source element `2`: the first refers to choice index `0` and the second to choice index `1`. The part before the dot is the numeric `id` of the source choice element. The part after the dot is the zero-based index of the selected choice in that element's `properties.choices` array. `choiceId` is not the localized choice text, the choice value, the element's `questionId`, or an independent choice identifier.

For a visibility rule to be valid:

- The rule object contains a non-empty `choiceId`.
- `choiceId` has the expected compound numeric shape: a positive source element ID and a non-negative choice index.
- The source element resolves in the same validation scope as the rule.
- The source element supports choices and has a choices array.
- The choice index is within that array and points to a valid choice.
- `catch-all` is not allowed.
- Duplicate `choiceId` values are rejected as redundant.

Rules in the same `conditionalRules` array use OR semantics: the element is visible when any referenced choice matches. A missing or empty array means the element is unconditional.

Choice indexes are positional and therefore order-sensitive. Removing or reordering choices can change which choice a rule refers to. Such changes require an explicit repair or confirmation, with every affected rule path reported; silently preserving the old string can change form behavior.

The `catch-all` suffix is reserved for group navigation and is not a concrete choice index.

### Dynamic rows

`dynamicRow.subElements` are full elements and must be validated recursively.

Sub-elements are reached through their parent dynamic row; they do not appear independently in top-level `layout` or group membership arrays.

Check:

- Row settings and localized row/button labels.
- Required minimum sub-elements.
- Unique sub-element IDs and question IDs in the correct scope.
- Supported sub-element types and compatible properties.
- Element visibility rules within the supported scope.
- Choice and validation rules using the same rules as top-level elements.
- `maxNumberOfRows`, when present, is an integer from 1 through `MAX_DYNAMIC_ROW_AMOUNT`, currently 50.
- No ambiguous reuse of sub-elements.
