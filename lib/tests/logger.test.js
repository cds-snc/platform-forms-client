import { logger, logMessage } from "@lib/logger";

describe("Logger wrapper", () => {
  test("Passes function through and returns value", () => {
    const mockFunction = jest.fn((x) => x + 10);
    const result = logger(mockFunction)(2);
    expect(result).toEqual(12);
    expect(mockFunction).toBeCalledWith(2).toBeCalledTimes(1);
  });
  test("Catches and rethrows error", () => {
    const mockFunction = jest.fn(() => {
      throw new Error("Mocked Error");
    });
    expect(() => {
      logger(mockFunction)();
    }).toThrow("Mocked Error");
  });
});
describe("logMessage function", () => {
  test("Logs an error message", () => {
    const spy = jest.spyOn(logMessage, "error");
    logMessage.error("This is an Error");
    expect(spy).toHaveBeenCalled().toHaveBeenCalledWith("This is an Error");
    spy.mockRestore();
  });
  describe("Uses the right log level", () => {
    const OLD_ENV = process.env;
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    test("During normal operation", () => {
      const testLogger = require("@lib/logger").logMessage;
      expect(testLogger.level).toEqual("info");
    });
  });
});
