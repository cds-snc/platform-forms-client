import { getSubmitDelayGroups, getSubmitDelayNoGroups } from "@lib/formContext";

describe("getSubmitDelayGroups function - group forms ", () => {
  it("Calculates the correct delay with time remaining.", () => {
    const startTime = 1728654096619;
    const currentTime = 1728654126078;  // about 29 seconds later
    const requiredQuestionsCount = 40;

    // delayFromFormData = 40 - 29 = 11
    // delay = 2 + 11 * 2 = 24
    const delay = getSubmitDelayGroups({startTime, currentTime, requiredQuestionsCount});
    expect(delay).toBe(24);
  });

  it("Calculates the correct delay with no time remaining and defaults to fallback number.", () => {
    const startTime = 1728654096619;
    const currentTime = 1728654126078;  // about 29 seconds later
    const requiredQuestionsCount = 10;
    
    // delayFromFormData = 10 - 29 = -19
    // delay = 2 + (-19 > 0...=1) * 2 = 4
    const delay = getSubmitDelayGroups({startTime, currentTime, requiredQuestionsCount});
    expect(delay).toBe(4);
  });

  it("Does not explode with invalid data.", () => {
    const startTime = 1728654096619;
    const currentTime = "INVALID";
    const requiredQuestionsCount = undefined;
    
    // @ts-expect-error - testing invalid input
    const delay1 = getSubmitDelayGroups({startTime, currentTime, requiredQuestionsCount});
    expect(delay1).toBe(4);

    // @ts-expect-error - testing invalid input
    const delay2 = getSubmitDelayGroups({requiredQuestionsCount, currentTime});
    expect(delay2).toBe(4);
  });
});

describe("getSubmitDelay function - non group forms ", () => {
  it("Calculates the correct delay.", () => {
    const requiredQuestionsCount = 40;

    // delayFromFormData = 40
    // delay = 2 + 40 * 2 = 82
    const delay = getSubmitDelayNoGroups({requiredQuestionsCount});
    expect(delay).toBe(82);
  });

  it("Does not explode with invalid data.", () => {
    const requiredQuestionsCount = undefined;

    // @ts-expect-error - testing invalid input
    const delay = getSubmitDelayNoGroups({requiredQuestionsCount});
    expect(delay).toBe(4);
  });
});
