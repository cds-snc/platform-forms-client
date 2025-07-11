# Announce

This package adds a util to help announce dynamic page updates in either a polite or assertive ARIA Live Region. The idea is to 1) have a live-region that is primed (in the DOM tree long before being used), and 2) make it convenient to announce a live region in any client workflow.

To use first add the Announce component ideally in a component near the root of the app by either adding the component `<Announce />` or calling `useAnnounce()`. Then to announce a dynamic update call `announce(YOUR_MESSAGE)` from any client context.

To test the announce live region is updating fire up any screen reader and make sure `announce(YOUR_MESSAGE)` is being announced. Another way is to check the content in the live region e.g. `document.querySelector("[data-testid='gc-announce-polite']").textContent`;
