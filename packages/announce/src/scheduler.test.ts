import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScheduler } from "./scheduler";

describe("announcement scheduler", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("ignores already-aborted requests", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const controller = new AbortController();
    controller.abort();
    scheduler.enqueue("Cancelled", "polite", { signal: controller.signal });
    expect(publish).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels only the pending requests associated with an aborted signal", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const controller = new AbortController();
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Stale", "polite", { signal: controller.signal });
    scheduler.enqueue("Other caller", "polite");
    scheduler.enqueue("Stale urgent", "assertive", { signal: controller.signal });
    // The assertive request has already published, so aborting cannot undo it.
    controller.abort();
    vi.runAllTimers();
    expect(publish.mock.calls).toEqual([
      ["First", "polite"],
      ["Stale urgent", "assertive"],
      ["Other caller", "polite"],
    ]);
  });

  it("removes cancelled requests immediately so they do not consume queue capacity", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const controller = new AbortController();
    scheduler.pause();
    for (let i = 0; i < 20; i++) {
      scheduler.enqueue(`Stale ${i}`, "polite", { signal: controller.signal });
    }
    controller.abort();
    scheduler.enqueue("Current", "polite");
    scheduler.resume();
    vi.runAllTimers();
    expect(publish).toHaveBeenCalledExactlyOnceWith("Current", "polite");
    expect(warn).not.toHaveBeenCalled();
  });

  it("detaches abort listeners when publishing, evicting, or stopping requests", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const scheduler = createScheduler(vi.fn());
    const published = new AbortController();
    const evicted = new AbortController();
    const stopped = new AbortController();
    const publishedCleanup = vi.spyOn(published.signal, "removeEventListener");
    const evictedCleanup = vi.spyOn(evicted.signal, "removeEventListener");
    const stoppedCleanup = vi.spyOn(stopped.signal, "removeEventListener");
    scheduler.enqueue("First", "polite", { signal: published.signal });
    expect(publishedCleanup).toHaveBeenCalledExactlyOnceWith("abort", expect.any(Function));
    scheduler.enqueue("Evicted", "polite", { signal: evicted.signal });
    scheduler.enqueue("Stopped", "polite", { signal: stopped.signal });
    for (let i = 0; i < 19; i++) scheduler.enqueue(`Pending ${i}`, "polite");
    expect(evictedCleanup).toHaveBeenCalledExactlyOnceWith("abort", expect.any(Function));
    scheduler.stop();
    expect(stoppedCleanup).toHaveBeenCalledExactlyOnceWith("abort", expect.any(Function));
  });

  it("publishes immediately when idle and paces subsequent messages in FIFO order", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Second", "polite");
    scheduler.enqueue("Third", "polite");

    expect(publish.mock.calls).toEqual([["First", "polite"]]);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(999);
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(publish).toHaveBeenLastCalledWith("Second", "polite");
    vi.advanceTimersByTime(1000);
    expect(publish).toHaveBeenLastCalledWith("Third", "polite");
    vi.advanceTimersByTime(1000);
    expect(vi.getTimerCount()).toBe(0);

    scheduler.enqueue("After idle", "polite");
    expect(publish).toHaveBeenLastCalledWith("After idle", "polite");
  });

  it("interrupts a polite cooldown once, paces assertive messages, then resumes polite work", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Polite first", "polite");
    scheduler.enqueue("Polite second", "polite");
    vi.advanceTimersByTime(200);
    scheduler.enqueue("Urgent first", "assertive");
    vi.advanceTimersByTime(200);
    scheduler.enqueue("Urgent second", "assertive");

    expect(publish.mock.calls).toEqual([
      ["Polite first", "polite"],
      ["Urgent first", "assertive"],
    ]);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(799);
    expect(publish).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(publish).toHaveBeenLastCalledWith("Urgent second", "assertive");
    vi.advanceTimersByTime(1000);
    expect(publish).toHaveBeenLastCalledWith("Polite second", "polite");
    expect(publish).toHaveBeenCalledTimes(4);
  });

  it("does not let polite messages interrupt an assertive cooldown", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Urgent", "assertive");
    scheduler.enqueue("Routine", "polite");
    vi.advanceTimersByTime(999);
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(publish).toHaveBeenLastCalledWith("Routine", "polite");
  });

  it("suppresses consecutive duplicates within each priority, including pending messages", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Same", "polite");
    scheduler.enqueue("Same", "polite");
    scheduler.enqueue("Different", "polite");
    scheduler.enqueue("Different", "polite");
    scheduler.enqueue("Same", "polite");
    scheduler.enqueue("Same", "assertive");
    scheduler.enqueue("Same", "assertive");
    vi.runAllTimers();

    expect(publish.mock.calls).toEqual([
      ["Same", "polite"],
      ["Same", "assertive"],
      ["Different", "polite"],
      ["Same", "polite"],
    ]);
    scheduler.enqueue("Same", "polite");
    expect(publish).toHaveBeenCalledTimes(4);
  });

  it("drops the oldest pending polite message on overflow and warns without logging content", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Urgent", "assertive");
    for (let i = 0; i < 21; i++) scheduler.enqueue(`Routine ${i}`, "polite");

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Pending message limit reached; discarded the oldest polite message."
    );
    vi.runAllTimers();
    expect(publish).toHaveBeenCalledTimes(21);
    expect(publish.mock.calls[1]).toEqual(["Routine 1", "polite"]);
    expect(publish).toHaveBeenLastCalledWith("Routine 20", "polite");
  });

  it.each(["polite", "assertive"] as const)(
    "paces allowed %s duplicates without changing subsequent default suppression",
    (priority) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      scheduler.enqueue("Same", priority);
      scheduler.enqueue("Same", priority, { allowDuplicates: true });
      scheduler.enqueue("Same", priority, { allowDuplicates: true });
      scheduler.enqueue("Same", priority, { allowDuplicates: false });
      scheduler.enqueue("Same", priority);
      expect(publish).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(999);
      expect(publish).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1);
      expect(publish).toHaveBeenCalledTimes(2);
      vi.advanceTimersByTime(1000);
      expect(publish).toHaveBeenCalledTimes(3);
      vi.runAllTimers();
      scheduler.enqueue("Same", priority);
      expect(publish.mock.calls).toEqual(Array.from({ length: 3 }, () => ["Same", priority]));
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it("retains allowed duplicates exposed by overflow", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Same", "polite");
    scheduler.enqueue("Urgent", "assertive");
    scheduler.enqueue("Intervening", "polite");
    scheduler.enqueue("Same", "polite", { allowDuplicates: true });
    for (let i = 0; i < 19; i++) scheduler.enqueue(`Urgent ${i}`, "assertive");
    vi.runAllTimers();
    expect(publish.mock.calls.filter(([, priority]) => priority === "polite")).toEqual([
      ["Same", "polite"],
      ["Same", "polite"],
    ]);
  });

  it("bounds allowed duplicates while paused and snapshots request options", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.pause();
    const options = { allowDuplicates: true };
    for (let i = 0; i < 21; i++) scheduler.enqueue("Same", "polite", options);
    options.allowDuplicates = false;
    expect(warn).toHaveBeenCalledTimes(1);
    expect(publish).not.toHaveBeenCalled();
    scheduler.resume();
    vi.runAllTimers();
    expect(publish).toHaveBeenCalledTimes(20);
  });

  it("drops the oldest assertive message when the pending queue contains only assertive messages", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "assertive");
    for (let i = 0; i < 21; i++) scheduler.enqueue(`Urgent ${i}`, "assertive");
    vi.runAllTimers();

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Pending message limit reached; discarded the oldest assertive message."
    );
    expect(publish).toHaveBeenCalledTimes(21);
    expect(publish.mock.calls[1]).toEqual(["Urgent 1", "assertive"]);
  });

  it("discards a newly arriving polite message rather than evicting pending assertive work", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "assertive");
    for (let i = 0; i < 20; i++) scheduler.enqueue(`Urgent ${i}`, "assertive");
    scheduler.enqueue("Routine", "polite");
    vi.runAllTimers();

    expect(warn).toHaveBeenCalledOnce();
    expect(publish).toHaveBeenCalledTimes(21);
    expect(publish).not.toHaveBeenCalledWith("Routine", "polite");
  });

  it("enforces the limit across both priorities", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "assertive");
    for (let i = 0; i < 10; i++) {
      scheduler.enqueue(`Routine ${i}`, "polite");
      scheduler.enqueue(`Urgent ${i}`, "assertive");
    }
    scheduler.enqueue("Extra urgent", "assertive");
    vi.runAllTimers();

    expect(publish).toHaveBeenCalledTimes(21);
    expect(publish).not.toHaveBeenCalledWith("Routine 0", "polite");
    expect(publish.mock.calls[11]).toEqual(["Extra urgent", "assertive"]);
    expect(publish.mock.calls[12]).toEqual(["Routine 1", "polite"]);
  });

  it("skips duplicates exposed by overflow without introducing an extra cooldown", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Same", "polite");
    scheduler.enqueue("Urgent", "assertive");
    scheduler.enqueue("Intervening", "polite");
    scheduler.enqueue("Same", "polite");
    for (let i = 0; i < 19; i++) scheduler.enqueue(`Urgent ${i}`, "assertive");
    vi.runAllTimers();

    expect(publish.mock.calls.filter(([, priority]) => priority === "polite")).toEqual([
      ["Same", "polite"],
    ]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops the scheduler, clearing timers and pending messages and preventing further announcements", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Pending", "polite");
    scheduler.stop();
    scheduler.stop();
    scheduler.enqueue("After stopping", "assertive");
    vi.runAllTimers();

    expect(publish.mock.calls).toEqual([["First", "polite"]]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores empty messages without starting a timer", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("", "polite");
    expect(publish).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("retains queued messages while paused, including assertive messages", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.pause();
    scheduler.enqueue("Routine", "polite");
    scheduler.enqueue("Urgent", "assertive");
    vi.advanceTimersByTime(2000);
    expect(publish).not.toHaveBeenCalled();
    scheduler.resume();
    expect(publish.mock.calls).toEqual([["Urgent", "assertive"]]);
    vi.advanceTimersByTime(1000);
    expect(publish).toHaveBeenLastCalledWith("Routine", "polite");
  });

  it("preserves the remaining cooldown when resumed", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Second", "polite");
    vi.advanceTimersByTime(200);
    scheduler.pause();
    vi.advanceTimersByTime(300);
    scheduler.resume();
    scheduler.resume();
    vi.advanceTimersByTime(499);
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(publish).toHaveBeenLastCalledWith("Second", "polite");
  });

  it("does not drain the queue when a cooldown expires while paused", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Second", "polite");
    scheduler.pause();
    vi.advanceTimersByTime(2000);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    scheduler.resume();
    expect(publish).toHaveBeenLastCalledWith("Second", "polite");
  });

  it("cannot resume a stopped scheduler", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.pause();
    scheduler.enqueue("Pending", "polite");
    scheduler.stop();
    scheduler.resume();
    vi.runAllTimers();
    expect(publish).not.toHaveBeenCalled();
  });

  it("stops and reports an immediate publisher failure without throwing", () => {
    const publish = vi.fn(() => {
      throw new Error("Private announcement text");
    });
    const onError = vi.fn();
    const scheduler = createScheduler(publish, onError);

    expect(() => scheduler.enqueue("First", "polite")).not.toThrow();
    scheduler.enqueue("Later", "assertive");
    scheduler.resume();
    vi.runAllTimers();

    expect(publish).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledExactlyOnceWith();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("discards pending work when a timed publication fails", () => {
    const publish = vi
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementation(() => {
        throw new Error("Private announcement text");
      });
    const onError = vi.fn();
    const scheduler = createScheduler(publish, onError);
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Fails", "polite");
    scheduler.enqueue("Discarded", "polite");

    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    vi.runAllTimers();
    expect(publish).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenCalledExactlyOnceWith();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("logs a diagnostic without announcement text when no error handler is supplied", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const scheduler = createScheduler(() => {
      throw new Error("Private announcement text");
    });
    scheduler.enqueue("Private announcement text", "polite");

    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Delivery stopped after a publication error."
    );
  });
});
