import { describe, it, expect } from "vitest";
import { getSecondsInWeeks, getWeeksInSeconds } from "./dateConversions";

describe("dateConversions", () => {
  it("getWeeksInSeconds returns the expected value", () => {
    const weeks1 = 1;
    const weeksInSeconds1 = getWeeksInSeconds(weeks1);
    expect(weeksInSeconds1).toBe(604800000);

    const weeks2 = 2;
    const weeksInSeconds2 = getWeeksInSeconds(weeks2);
    expect(weeksInSeconds2).toBe(1209600000);

    const weeks3 = 3;
    const weeksInSeconds3 = getWeeksInSeconds(weeks3);
    expect(weeksInSeconds3).toBe(1814400000);

    const weeks4 = 12;
    const weeksInSeconds4 = getWeeksInSeconds(weeks4);
    expect(weeksInSeconds4).toBe(7257600000);
  });

  it("getSecondsInWeeks returns the expected value - the result should match the above test input (undoes the operation)", () => {
    const seconds1 = 604800000;
    const secondsInWeeks1 = getSecondsInWeeks(seconds1);
    expect(secondsInWeeks1).toBe(1);

    const seconds2 = 1209600000;
    const secondsInWeeks2 = getSecondsInWeeks(seconds2);
    expect(secondsInWeeks2).toBe(2);

    const seconds3 = 1814400000;
    const secondsInWeeks3 = getSecondsInWeeks(seconds3);
    expect(secondsInWeeks3).toBe(3);

    const seconds4 = 7257600000;
    const secondsInWeeks4 = getSecondsInWeeks(seconds4);
    expect(secondsInWeeks4).toBe(12);
  });

  it("more explicity test weeks to seconds and convertiong seconds to weeks, results in the original weeks value", () => {
    const weeks = 11;
    const weeksInSeconds = getWeeksInSeconds(weeks);
    const secondsInWeeks = getSecondsInWeeks(weeksInSeconds);
    expect(secondsInWeeks).toBe(weeks);
  });
});
