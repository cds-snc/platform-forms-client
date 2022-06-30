import { logger, logMessage } from "@lib/logger";

describe("Logger wrapper", () => {
  it("Passes function through and returns value", () => {
    const mockFunction = jest.fn((x) => x + 10);
    const result = logger(mockFunction)(2);
    expect(result).toEqual(12);
    expect(mockFunction).toBeCalledWith(2);
    expect(mockFunction).toBeCalledTimes(1);
  });
  it("Catches and rethrows error", () => {
    const mockFunction = jest.fn(() => {
      throw new Error("Mocked Error");
    });
    expect(() => {
      logger(mockFunction)();
    }).toThrow("Mocked Error");
  });
});
describe("logMessage function", () => {
  it("Logs an error message", () => {
    const spy = jest.spyOn(logMessage, "error");
    logMessage.error("This is an Error");
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("This is an Error");
    spy.mockRestore();
  });
});
