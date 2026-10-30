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

  it.each(["polite", "assertive"] as const)(
    "keeps a shared %s announcement until its last caller cancels",
    (priority) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      const first = new AbortController();
      const second = new AbortController();
      scheduler.pause();
      scheduler.enqueue("Saved", priority, { signal: first.signal });
      scheduler.enqueue("Saved", priority, { signal: second.signal });
      first.abort();
      scheduler.resume();
      vi.runAllTimers();
      expect(publish).toHaveBeenCalledExactlyOnceWith("Saved", priority);
    }
  );

  it.each([false, true])(
    "keeps a shared announcement requested without a signal (first: %s)",
    (withoutSignalFirst) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      const controller = new AbortController();
      scheduler.pause();
      const cancellable = { signal: controller.signal };
      scheduler.enqueue("Saved", "polite", withoutSignalFirst ? {} : cancellable);
      scheduler.enqueue("Saved", "polite", withoutSignalFirst ? cancellable : {});
      controller.abort();
      scheduler.resume();
      vi.runAllTimers();
      expect(publish).toHaveBeenCalledExactlyOnceWith("Saved", "polite");
    }
  );

  it("removes a shared announcement only when all its callers cancel", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const first = new AbortController();
    const second = new AbortController();
    scheduler.pause();
    scheduler.enqueue("Saved", "polite", { signal: first.signal });
    scheduler.enqueue("Saved", "polite", { signal: second.signal });
    second.abort();
    first.abort();
    scheduler.resume();
    vi.runAllTimers();
    expect(publish).not.toHaveBeenCalled();
  });

  it("deduplicates requests sharing a signal and removes its listener on cancellation", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const controller = new AbortController();
    const addListener = vi.spyOn(controller.signal, "addEventListener");
    const removeListener = vi.spyOn(controller.signal, "removeEventListener");
    scheduler.pause();
    scheduler.enqueue("Saved", "polite", { signal: controller.signal });
    scheduler.enqueue("Saved", "polite", { signal: controller.signal });
    expect(addListener).toHaveBeenCalledTimes(1);
    controller.abort();
    expect(removeListener).toHaveBeenCalledTimes(1);
    scheduler.resume();
    expect(publish).not.toHaveBeenCalled();
  });

  it.each(["publication", "overflow", "stop"] as const)(
    "detaches every shared caller's listener on %s",
    (reason) => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      const first = new AbortController();
      const second = new AbortController();
      const firstCleanup = vi.spyOn(first.signal, "removeEventListener");
      const secondCleanup = vi.spyOn(second.signal, "removeEventListener");
      scheduler.pause();
      scheduler.enqueue("Saved", "polite", { signal: first.signal });
      scheduler.enqueue("Saved", "polite", { signal: second.signal });
      if (reason === "publication") {
        scheduler.resume();
        vi.runAllTimers();
        expect(publish).toHaveBeenCalledExactlyOnceWith("Saved", "polite");
      } else if (reason === "overflow") {
        for (let i = 0; i < 20; i++) scheduler.enqueue(`Pending ${i}`, "polite");
      } else {
        scheduler.stop();
      }
      expect(firstCleanup).toHaveBeenCalledExactlyOnceWith("abort", expect.any(Function));
      expect(secondCleanup).toHaveBeenCalledExactlyOnceWith("abort", expect.any(Function));
      scheduler.stop();
    }
  );

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

  it("suppresses rapid and pending duplicates within each priority, then permits later repeats", () => {
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
    expect(publish).toHaveBeenCalledTimes(5);
    expect(publish).toHaveBeenLastCalledWith("Same", "polite");
  });

  it.each(["polite", "assertive"] as const)(
    "suppresses a published %s duplicate at 999 ms but accepts it at 1000 ms and after idle",
    (priority) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      scheduler.enqueue("Changes saved.", priority);
      vi.advanceTimersByTime(999);
      scheduler.enqueue("Changes saved.", priority);
      expect(publish).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(1);
      scheduler.enqueue("Changes saved.", priority);
      expect(publish.mock.calls).toEqual([
        ["Changes saved.", priority],
        ["Changes saved.", priority],
      ]);
      vi.advanceTimersByTime(60000);
      scheduler.enqueue("Changes saved.", priority);
      expect(publish).toHaveBeenCalledTimes(3);
    }
  );

  it("keeps duplicate windows independent when assertive work interrupts a polite cooldown", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Same", "polite");
    vi.advanceTimersByTime(400);
    scheduler.enqueue("Same", "assertive");
    vi.advanceTimersByTime(599);
    scheduler.enqueue("Same", "polite");
    expect(publish).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    scheduler.enqueue("Same", "polite");
    vi.advanceTimersByTime(399);
    scheduler.enqueue("Same", "assertive");
    expect(publish).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    scheduler.enqueue("Same", "assertive");
    expect(publish.mock.calls).toEqual([
      ["Same", "polite"],
      ["Same", "assertive"],
      ["Same", "polite"],
      ["Same", "assertive"],
    ]);
  });

  it("suppresses pending duplicates during a long pause and starts the window at publication", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.pause();
    scheduler.enqueue("Same", "polite");
    vi.advanceTimersByTime(60000);
    scheduler.enqueue("Same", "polite");
    scheduler.resume();
    vi.advanceTimersByTime(999);
    scheduler.enqueue("Same", "polite");
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    scheduler.enqueue("Same", "polite");
    expect(publish).toHaveBeenCalledTimes(2);
    vi.runAllTimers();
    expect(publish).toHaveBeenCalledTimes(2);
  });

  it("removes abort listeners from duplicates exposed by cancellation after the window expires", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const intervening = new AbortController();
    const repeated = new AbortController();
    const cleanup = vi.spyOn(repeated.signal, "removeEventListener");
    scheduler.enqueue("Same", "polite");
    scheduler.enqueue("Intervening", "polite", { signal: intervening.signal });
    scheduler.enqueue("Same", "polite", { signal: repeated.signal });
    intervening.abort();
    vi.advanceTimersByTime(1000);
    expect(publish.mock.calls).toEqual([
      ["Same", "polite"],
      ["Same", "polite"],
    ]);
    expect(cleanup).toHaveBeenCalledExactlyOnceWith("abort", expect.any(Function));
  });

  it.each(["polite", "assertive"] as const)(
    "deduplicates pending %s requests by both text and language",
    (priority) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      scheduler.pause();
      for (const lang of ["en", "fr", undefined]) {
        scheduler.enqueue("Menu", priority, { lang });
        scheduler.enqueue("Menu", priority, { lang });
      }
      scheduler.resume();
      vi.runAllTimers();
      expect(publish.mock.calls).toEqual([
        ["Menu", priority, "en"],
        ["Menu", priority, "fr"],
        ["Menu", priority],
      ]);
    }
  );

  it.each(["polite", "assertive"] as const)(
    "only suppresses a recently published %s duplicate in the same language",
    (priority) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      scheduler.enqueue("Menu", priority, { lang: "en" });
      vi.advanceTimersByTime(999);
      scheduler.enqueue("Menu", priority, { lang: "en" });
      expect(publish).toHaveBeenCalledTimes(1);
      scheduler.enqueue("Menu", priority, { lang: "fr" });
      vi.advanceTimersByTime(1);
      expect(publish.mock.calls).toEqual([
        ["Menu", priority, "en"],
        ["Menu", priority, "fr"],
      ]);
      scheduler.enqueue("Menu", priority, { lang: "fr" });
      expect(vi.getTimerCount()).toBe(1);
      vi.advanceTimersByTime(1000);
      expect(publish).toHaveBeenCalledTimes(2);
      scheduler.enqueue("Menu", priority, { lang: "fr" });
      expect(publish).toHaveBeenLastCalledWith("Menu", priority, "fr");
      expect(publish).toHaveBeenCalledTimes(3);
    }
  );

  it("keeps different-language requests separate when one caller cancels", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const english = new AbortController();
    scheduler.pause();
    scheduler.enqueue("Menu", "polite", { lang: "en", signal: english.signal });
    scheduler.enqueue("Menu", "polite", { lang: "fr" });
    english.abort();
    scheduler.resume();
    expect(publish).toHaveBeenCalledExactlyOnceWith("Menu", "polite", "fr");
  });

  it("snapshots the requested language while waiting for publication", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const options = { lang: "fr" };
    scheduler.pause();
    scheduler.enqueue("Bonjour.", "polite", options);
    options.lang = "en";
    scheduler.resume();
    expect(publish).toHaveBeenCalledExactlyOnceWith("Bonjour.", "polite", "fr");
  });

  it("does not expire duplicate history when the wall clock changes", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    scheduler.enqueue("Same", "polite");
    vi.setSystemTime(Date.now() + 60000);
    scheduler.enqueue("Same", "polite");
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1000);
    scheduler.enqueue("Same", "polite");
    expect(publish).toHaveBeenCalledTimes(2);
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
      scheduler.enqueue("Same", priority);
      vi.runAllTimers();
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

  it("publishes duplicates exposed by overflow after their suppression window expires", () => {
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

  it("preserves the polite deadline when an urgent request is cancelled while paused", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const urgent = new AbortController();
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Second", "polite");
    vi.advanceTimersByTime(200);
    scheduler.pause();
    scheduler.enqueue("Urgent", "assertive", { signal: urgent.signal });
    urgent.abort();
    vi.advanceTimersByTime(100);
    scheduler.resume();
    expect(publish.mock.calls).toEqual([["First", "polite"]]);
    vi.advanceTimersByTime(699);
    expect(publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(publish.mock.calls).toEqual([
      ["First", "polite"],
      ["Second", "polite"],
    ]);
  });

  it("does not restart an expired cooldown after cancelling urgent work while paused", () => {
    const publish = vi.fn();
    const scheduler = createScheduler(publish);
    const urgent = new AbortController();
    scheduler.enqueue("First", "polite");
    scheduler.enqueue("Second", "polite");
    vi.advanceTimersByTime(200);
    scheduler.pause();
    scheduler.enqueue("Urgent", "assertive", { signal: urgent.signal });
    urgent.abort();
    vi.advanceTimersByTime(1000);
    expect(publish).toHaveBeenCalledTimes(1);
    scheduler.resume();
    expect(publish.mock.calls).toEqual([
      ["First", "polite"],
      ["Second", "polite"],
    ]);
  });

  it.each([false, true])(
    "interrupts a polite cooldown on resume while urgent work remains (one caller cancelled: %s)",
    (cancelFirstCaller) => {
      const publish = vi.fn();
      const scheduler = createScheduler(publish);
      const first = new AbortController();
      const second = new AbortController();
      scheduler.enqueue("First", "polite");
      scheduler.enqueue("Second", "polite");
      vi.advanceTimersByTime(200);
      scheduler.pause();
      scheduler.enqueue("Urgent", "assertive", { signal: first.signal });
      scheduler.enqueue("Urgent", "assertive", { signal: second.signal });
      scheduler.enqueue("Next urgent", "assertive");
      if (cancelFirstCaller) first.abort();
      vi.advanceTimersByTime(100);
      expect(publish).toHaveBeenCalledTimes(1);
      scheduler.resume();
      expect(publish.mock.calls).toEqual([
        ["First", "polite"],
        ["Urgent", "assertive"],
      ]);
      vi.advanceTimersByTime(999);
      expect(publish).toHaveBeenCalledTimes(2);
      vi.advanceTimersByTime(1);
      expect(publish).toHaveBeenLastCalledWith("Next urgent", "assertive");
      vi.advanceTimersByTime(1000);
      expect(publish).toHaveBeenLastCalledWith("Second", "polite");
      expect(publish).toHaveBeenCalledTimes(4);
    }
  );

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
