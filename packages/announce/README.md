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
```

In Next.js, call `announce()` from client components. The announcer includes its
own inline visually hidden styles; no stylesheet is needed.

## Behaviour

- After a host's 100 ms activation delay, publishes immediately when idle, then
  spaces updates one second apart. Activation is a settling delay, not confirmation
  that a screen reader is ready.
- Assertive messages can skip the wait between polite updates. Messages stay
  ordered within each priority. Consecutive duplicates in the same priority are
  suppressed.
- Holds up to 20 pending messages. Overflow drops the oldest polite message
  first, otherwise the oldest assertive message, and logs a warning.
- Calls before any active host registers or on the server are ignored.
  Removing the last active host discards pending messages and cancels timers.
- An unexpected internal error logs a diagnostic without announcement text and
  stops delivery, rather than letting the error escape into the app. Pending
  messages are discarded. Delivery restarts only after all active hosts have
  unregistered and a new host registers.

## Modals

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
