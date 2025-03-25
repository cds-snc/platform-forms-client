import { FormServerErrorCodes } from '@lib/types/form-builder-types';
import { logErrorMessage } from './action';

describe("logMessageError function", () => {
  test("Fails with an invalid data", async () => {
    const message = undefined;
    // @ts-expect-error - Testing invalid data
    const result = await logErrorMessage(message);  
    expect(result).toEqual(false);
  });
  test("Fails with an invalid code", async () => {
    const result = await logErrorMessage("NOPE", "1234", 1742927526697);
    expect(result).toEqual(false);
  });
  test("Fails with a valid code but missing formId", async () => {
    // @ts-expect-error - Testing invalid data
    const result = await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, undefined, 1742927526697);
    expect(result).toEqual(false);
  });
  test("Fails with a valid code and formId but is missing a timestamp", async () => {
    // @ts-expect-error - Testing invalid data
    const result = await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, 123);
    expect(result).toEqual(false);
  });
  test("Succees with a valid code and formId", async () => {
    const result = await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, "1234", 1742927526697);
    expect(result).toEqual(true);
  });
});

