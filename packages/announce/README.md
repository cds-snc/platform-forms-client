# Announce

This package adds a util to help announce dynamic page updates in either a polite or assertive ARIA Live Region. The idea is to 1) have a live-region that is primed (in the DOM tree long before being used), and 2) make it convenient to announce a live region in any client workflow.

To use first add the `<Announce />`  component ideally in a component near the root of the app. Then to announce a dynamic update from any client context call `announce(YOUR_MESSAGE)`. Or for an assertive message call `announce(YOUR_MESSAGE, Priority.HIGH)`. 
