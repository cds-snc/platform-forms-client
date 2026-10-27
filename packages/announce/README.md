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

- Publishes immediately when idle, then spaces updates one second apart.
- Assertive messages can skip the wait between polite updates. Messages stay
  ordered within each priority. Consecutive duplicates in the same priority are
  suppressed.
- Holds up to 20 pending messages. Overflow drops the oldest polite message
  first, otherwise the oldest assertive message, and logs a warning.
- Calls before the announcer's listeners attach or on the server are ignored.
  Unmounting discards pending messages and cancels timers.
