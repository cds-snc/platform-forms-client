import { logMessage } from "@lib/logger";

describe("logMessage function", () => {
  it("Logs an error message", () => {
    const spy = jest.spyOn(logMessage, "error");
    logMessage.error("This is an Error");
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("This is an Error");
    spy.mockRestore();
  });
});
