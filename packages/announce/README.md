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
own visually hidden styles; no stylesheet is needed.

### Request options

Pass options as the third argument to `announce()`:

- `allowDuplicates: true` allows repeated identical messages.
- `lang: "fr"` sets the announcement's language. Omit it to inherit the host's language.
- `signal` cancels pending feedback through an `AbortController`; it cannot stop
  already published speech.

```ts
const controller = new AbortController();
announce("Upload complete.", Priority.LOW, { signal: controller.signal });

// When the associated UI closes or unmounts:
controller.abort();
```

## React state updates

Use `useAnnounce()` inside a component for state-driven feedback. It debounces
updates and cancels its pending request when inputs change, it becomes inactive,
or it unmounts. Use `announce()` for discrete events instead.

```tsx
import { useAnnounce } from "@gcforms/announce";

useAnnounce(message, {
  active: isOpen,
  delay: 400,
  resetKey: searchText,
  skipOnActivation: true,
});
```

Defaults are active, polite, and no debounce. The hook also accepts `priority`,
`lang`, and `allowDuplicates`.

`resetKey` restarts the debounce even when the message stays the same.
`skipOnActivation` skips the first update each time `active` becomes true.

## Modals

Keep the root announcer and add a host **inside** each modal needing announcements.
Background live regions can become inaccessible while a modal is open.

```tsx
<Announce scope="modal" active={isOpen} />
```

Keep `active` in sync with whether the modal is open. Announcements go to the most
recently activated modal; closing it returns delivery to the previous modal or root.
Pending messages follow the active host; published messages aren't replayed.

GC Forms' shared `Dialog` opts in with `withAnnounce`.

When migrating from the removed `useAllowDuplicateAnnouncer` or
`AllowDuplicateAnnouncer`, use `useAnnounce()` or `announce()` with
`allowDuplicates: true`.
