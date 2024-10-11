import { calculateSubmitDelay } from "@lib/formContext";

describe("calculateSubmitDelay function", () => {
  it("Calculates the correct delay with time remaining.", () => {
    const startTime = 1728654096619;
    const currentTime = 1728654126078;  // about 29 seconds later
    const requiredQuestionsCount = 40;

    // delayFromFormData = 40 - 29 = 11
    // delay = 2 + 11 * 2 = 24
    const delay = calculateSubmitDelay(startTime, currentTime, requiredQuestionsCount);
    expect(delay).toBe(24);
  });

  it("Calculates the correct delay with no time remaining and defaults to fallback number.", () => {
    const startTime = 1728654096619;
    const currentTime = 1728654126078;  // about 29 seconds later
    const requiredQuestionsCount = 10;
    
    // delayFromFormData = 10 - 29 = -19
    // delay = 2 + (-19 > 0...=1) * 2 = 4
    const delay = calculateSubmitDelay(startTime, currentTime, requiredQuestionsCount);
    expect(delay).toBe(4);
  });

  it("Does not explode with invalid data.", () => {
    const startTime = 1728654096619;
    const currentTime = "INVALID";
    const requiredQuestionsCount = undefined;
    
    // @ts-expect-error - testing invalid input
    const delay1 = calculateSubmitDelay(startTime, currentTime, requiredQuestionsCount);
    expect(delay1).toBe(4);

    // @ts-expect-error - testing invalid input
    const delay2 = calculateSubmitDelay(requiredQuestionsCount, currentTime);
    expect(delay2).toBe(4);
  });
});