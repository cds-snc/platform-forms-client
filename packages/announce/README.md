# Announce

This package adds a util to help announce dynamic page updates in either a polite or assertive ARIA Live Region. The idea is to 1) have a live-region that is primed (in the DOM tree long before being used), and 2) make it convenient to announce a live region in any client workflow.

To use first add the `<Announce />`  component ideally in a component near the root of the app. Then to announce a dynamic update from any client context call `announce(YOUR_MESSAGE)`. Or for an assertive message call `announce(YOUR_MESSAGE, Priority.HIGH)`. 

## Scheduler

Announcements use a **priority-aware announcement queue with paced delivery**.
The public API is unchanged: `announce(message, priority)` submits a message;
the scheduler decides when to publish it to a live region.

- Mount exactly one `<Announce />` near the app root. It owns the scheduler and
  keeps both live regions mounted and initially empty.
- When idle, the scheduler publishes immediately. Further publications are
  separated by a fixed, internal 1000 ms cooldown.
- Messages are FIFO within each priority. Pending assertive messages are
  published before pending polite messages.
- An assertive message immediately interrupts a polite cooldown. Consecutive
  assertive publications remain paced. Pending polite messages resume after
  assertive work drains and its final cooldown ends.
- Published polite messages are not replayed after an interruption.
- Consecutive identical messages within each priority are suppressed, including
  duplicates at the end of that priority's pending queue. The same text can be
  published again after a different message in that priority.
- At most 20 messages can be pending across both queues, excluding the message
  already published. On overflow, the oldest pending polite message is discarded
  first, or the oldest assertive message if no polite messages are pending.
  A newly submitted polite message is itself discarded if all 20 pending
  messages are assertive. Each discarded message produces a console warning
  without including message content.

### Lifecycle and limitations

Requests made before the host's effect attaches its listeners, after unmounting,
or on the server are not buffered. Unmounting clears pending messages and timers;
remounting starts a fresh scheduler. A requesting component unmounting does not
cancel its messages while the root host remains mounted. Pending messages have
no time-based expiration or cancellation API in this iteration.

The cooldown spaces DOM updates; it does **not** measure speech duration or
confirm screen-reader delivery. Assertive updates may interrupt speech or clear
screen-reader queues. Screen-reader/browser testing is needed to tune pacing,
and important information should also remain available in the interface.
This iteration does not add alternating-region or repeated-message workarounds.
