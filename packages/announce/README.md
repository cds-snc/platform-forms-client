
-- TODO TIDY UP THIS README

# Announce

Screen-reader announcements for React apps, with persistent live regions and a
priority queue that spaces out updates.

> **Note:** The scheduler can't tell when a screen reader has finished speaking.
> The delay simply spaces out live-region updates to reduce rapid overwrites; it
> doesn't wait for speech to finish or guarantee that every message is spoken.
> Keep important information available in the interface and test with your target
> screen readers.

## Install

```sh
npm install @gcforms/announce
```

Requires React and React DOM 19.1 or later within version 19. This package ships
TypeScript/TSX source, so your bundler must transpile it and resolve extensionless
imports. Import from `@gcforms/announce`; deep imports are not supported.

## Usage

Mount one announcer near your app root and keep it mounted across navigation:

```tsx
import { Announce } from "@gcforms/announce";

export function App() {
  return (
    <>
      {/* Your app */}
      <Announce />
    </>
  );
}
```

Then announce updates from client-side code:

```ts
import { announce, Priority } from "@gcforms/announce";

announce("Your changes have been saved."); // Polite by default
announce("Your session is about to expire.", Priority.HIGH); // Assertive
announce("5 results available.", Priority.LOW, { allowDuplicates: true });
```

In Next.js, call `announce()` from client components. The announcer includes its
own inline visually hidden styles; no stylesheet is needed.

Set `lang` when the announcement language differs from the host's surroundings:

```ts
announce("Bonjour.", Priority.LOW, { lang: "fr" });
```

The receiving live region gets that language before its text is updated. Omitting
`lang` uses the host's inherited language, including after an explicitly localized
message. This sets language metadata for assistive technology; it does not translate
the message.

By default, consecutive identical requests in each priority are suppressed while
pending or for one second after publication. After that window, the same text can
be requested again. The window starts when the message is published, not queued.
Requests with different `lang` values are treated as different announcements.

Set `allowDuplicates: true` on a request to bypass both duplicate checks. It still
uses the shared queue, timing, and overflow rules.
Hosts keep two empty live regions per priority mounted, alternating repeated text
between them to produce a fresh update. This does not guarantee repeated speech
across all screen readers.

Pass an `AbortSignal` to cancel a request that has not yet been published:

```ts
const controller = new AbortController();
announce("5 results available.", Priority.LOW, {
  allowDuplicates: true,
  signal: controller.signal,
});
controller.abort();
```

For transient feedback, abort the previous request when the input changes or the
component closes or unmounts. This removes pending feedback without affecting other
callers. It cannot stop speech for a message that has already been published.

Identical pending requests share one announcement by default. Aborting one caller's
signal only removes that caller's request; the announcement remains pending while
another caller still needs it. A request without a signal keeps it pending even if
the other callers cancel.

## Announce updates from React components

Use `useAnnounce()` to debounce feedback as React state changes. It calls
`announce()` and renders no live regions of its own:

```tsx
useAnnounce(message, {
  active: isOpen,
  delay: 400,
  skipOnActivation: true,
  allowDuplicates: true,
  resetKey: searchText,
});
```

Import `useAnnounce` from `@gcforms/announce`. By default it is active, uses polite
priority and a zero-millisecond debounce, and does not skip activation feedback.
`delay` must be a non-negative finite number of milliseconds; shared queue timing
still applies after the debounce. Set `priority` to `Priority.HIGH` for assertive
feedback. The hook also accepts `lang`, with the same behavior as `announce()`.

`skipOnActivation` skips the first request whenever `active` becomes true,
including an initially active mount. `resetKey` restarts the debounce even when
the message stays the same; use a stable value such as the current search text.
Changes to the message or options, deactivation, and unmount cancel this hook's
pending request, leaving other callers unaffected. Empty messages cancel pending
feedback without submitting a new request. Already published speech cannot be
cancelled.

The former `useAllowDuplicateAnnouncer` and `AllowDuplicateAnnouncer` exports have
been removed. Use `useAnnounce()` or `announce()` with `allowDuplicates: true`
instead. A root host (or an opted-in modal host) must be present.

## Note on Modals

Keep the root announcer and add a host **inside** each modal that needs announcements.
Background content, including the root live regions, can become inaccessible while
a modal is open.

```tsx
<Announce scope="modal" active={isOpen} />
```

GC Forms' shared `Dialog` makes this opt-in: pass `withAnnounce` to enable its
modal host. By default, no announcer markup is added to the dialog.

Keep `active` in sync with whether the modal is open. All hosts share one queue,
with announcements going to the most recently activated modal. Closing it
returns delivery to the previous modal or the root.

Pending messages follow the active host; previously published messages aren't
replayed.

Host changes preserve the remaining publication cooldown. Pending assertive work
can interrupt a polite cooldown once the new host is ready. Cancelling that work
before delivery leaves the original polite cooldown intact.

## Future work

- More thought about whether to include logging or not
- Review imperative `announce()` calls in file inputs, dynamic rows, and right-panel
  updates. Use an `AbortSignal` to cancel pending feedback when the UI it describes
  closes or unmounts, while allowing application-wide notifications to survive
  navigation. Avoid clearing the whole queue on navigation or modal handoff.
