import { calculateDelayWithGroups, calculateDelayWithoutGroups } from "@lib/hooks/useFormDelayContext";
import { FormElement } from "@lib/types";
import {formElementsNonGroups} from "../../__fixtures__/formDelayElements.json";

describe("calculateDelayWithGroups", () => {
  it("Should return a delay", () => {
    // Duration is about 8 seconds
    const startTime = 1729535404118;
    const endTime = 1729535412897;

    const requiredQuestions = 50;

    // delay = 2 + (50 - 8) * 2 = 86
    const delay = calculateDelayWithGroups(startTime, endTime, requiredQuestions);
    expect(delay).toBe(86);
  });

  it("Should return no delay (negative number))", () => {
    // Duration is about 8 seconds
    const startTime = 1729535404118;
    const endTime = 1729535412897;

    const requiredQuestions = 5;

    // delay = 2 + (5 - 8) * 2 = -4
    const delay = calculateDelayWithGroups(startTime, endTime, requiredQuestions);
    expect(delay).toBe(-4);
  });

  it("Should handle invalid input", () => {
    // Duration is about 8 seconds
    const startTime = undefined;
    const endTime = "invalid";

    const requiredQuestions = {};

    // @ts-expect-error - testing invalid input
    const delay = calculateDelayWithGroups(startTime, endTime, requiredQuestions);
    expect(delay).toBe(-1);
  });
});

describe("calculateDelayWithoutGroups", () => {
  it("Should return a delay", () => {
    // Required questions from elements = 3
    // delay = 2 + 3 * 2 = 8
    const delay = calculateDelayWithoutGroups(formElementsNonGroups as FormElement[]);
    expect(delay).toBe(8);
  });

  it("Should return a delay", () => {
    // Required questions from elements = 0
    // delay = 2 + 0 * 2 = 2
    const delay = calculateDelayWithoutGroups([]);
    expect(delay).toBe(2);
  });

  it("Should handle invalid input", () => {
    // @ts-expect-error - testing invalid input
    const delay1 = calculateDelayWithoutGroups();
    expect(delay1).toBe(-1);

    // @ts-expect-error - testing invalid input
    const delay2 = calculateDelayWithoutGroups({});
    expect(delay2).toBe(-1);
  });
});
