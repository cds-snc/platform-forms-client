import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createScheduler } from "./scheduler";

describe("announcement scheduler", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
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
});
