# Announce

TODO: more thought about whether to include logging or not

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

Set `allowDuplicates: true` on a request to publish it even when its text matches
the previous message. It still uses the shared queue, timing, and overflow rules.
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
feedback.

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
