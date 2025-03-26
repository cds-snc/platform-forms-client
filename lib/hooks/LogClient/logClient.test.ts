import { FormServerErrorCodes } from '@lib/types/form-builder-types';
import { logErrorMessage } from './action';
import { logMessage } from "@lib/logger";

describe("logMessageError function", () => {
  test("Fails with an invalid data", async () => {
    const spy = jest.spyOn(logMessage, "error");
    // @ts-expect-error - Testing invalid data
    await logErrorMessage();
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  test("Fails with an invalid code", async () => {
    const spy = jest.spyOn(logMessage, "error");
    await logErrorMessage("NOPE", "1234", 1742927526697);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  test("Fails with a valid code but missing formId", async () => {
    const spy = jest.spyOn(logMessage, "error");
    // @ts-expect-error - Testing invalid data
    await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, undefined, 1742927526697);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it("Succees with a valid code and formId", async () => {
    const spy = jest.spyOn(logMessage, "error");
    await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, "1234", 1742927526697);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("Client Error: FR08-1742927526697 - formID: 1234");
    spy.mockRestore();
  });
});

