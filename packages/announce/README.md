# Announce

Live regions work best when they’re already in the DOM before a message is added. 
This package sets up shared polite and assertive live regions near your app root, ready to use. 
Components can then call announce() instead of creating and managing their own regions.

## Features
- Set the language of individual announcements
- Support repeated identical messages when needed
- Route announcements between root and modal hosts
- Debounce React state updates and cancel scheduled feedback when inputs change or components unmount

## How to Use

### Set up the root host

A host is a mounted set of live regions. The root host is the app’s default announcement destination.

Mount one host near your app root and keep it mounted across navigation:

```tsx
import { AnnounceLiveRegion } from "@gcforms/announce";

export function App() {
  return (
    <>
      {/* Your app */}
      <AnnounceLiveRegion />
    </>
  );
}
```

The host includes its own visually hidden styles; no stylesheet is needed.
Requests made before a host registers, or while no host is active, are dropped.

### Announce an update

Call `announce()` from client-side event handlers or effects, not during render:

```ts
import { announce, Priority } from "@gcforms/announce";

announce("Your changes have been saved."); // Polite by default
announce("Your session is about to expire.", Priority.HIGH);
```

Use assertive announcements sparingly: they can interrupt what the screen reader
is already saying. Keep important information available in the interface too.

Pass options as the third argument:

```ts
announce("Bonjour.", Priority.LOW, { lang: "fr" });
announce("Your changes have been saved.", Priority.LOW, { allowDuplicates: true });
```

`lang` sets language metadata, not a translation. Omit it to inherit the host's
language. Identical consecutive messages with the same language and priority are
normally suppressed for one second after publication; `allowDuplicates` bypasses
that check. Repeated speech still depends on the browser and screen reader.

### Announce React state changes

Use `useAnnounce()` inside a component for feedback that changes with state:

```tsx
import { useAnnounce } from "@gcforms/announce";

// Inside your component:
useAnnounce(resultsMessage, {
  active: isOpen,
  delay: 400,
  resetKey: searchText,
  skipOnActivation: true,
});
```

The hook waits until updates settle, then submits the latest message. Changing
inputs, closing the UI, or unmounting cancels its scheduled feedback, not speech
already published.

- `active` defaults to `true`.Set to `false` when feedback is no longer relevant
- `delay` defaults to `0` and accepts non-negative milliseconds
- `resetKey` restarts the debounce even if the message stays the same
- `skipOnActivation` skips the first update on mount or whenever `active` becomes true
- `priority`, `lang`, and `allowDuplicates` work like the imperative API

The hook uses the shared host. It doesn't render live regions of its own.

### Using inside a modal

Background live regions can become inaccessible while a modal is open. Keep the
root host mounted and add a host inside the modal so announcements stay accessible:

```tsx
<AnnounceLiveRegion scope="modal" active={isOpen} />
```

Keep `active` in sync with the modal's open state. Messages go to the most recently
registered active modal host, then back to the previous modal or root when it
unregisters.

Callers still use the same `announce()` or `useAnnounce()` API. The package chooses
the host, so components don't need to know whether they're inside a modal.
Each message goes to one host. Published messages aren't replayed when hosts change.

In GC Forms, pass `withAnnounce` to the shared `Dialog` to enable its modal host.

## What about rapid updates?

This package doesn’t queue or space out announcements. Rapid updates can overwrite each other before they’re spoken.
We tested pacing: it helped NVDA/JAWS and some VoiceOver cases, but results varied by browser, message length, and priority. We’ve left scheduling out of this version to keep things simple. 
See [#8104](https://github.com/cds-snc/platform-forms-client/pull/8104/).

For related updates, consider combining them into one meaningful message before calling announce(). Automatic combining isn’t currently planned—the caller knows best which messages belong together.
