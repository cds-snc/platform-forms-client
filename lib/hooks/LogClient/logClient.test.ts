import { FormServerErrorCodes } from '@lib/types/form-builder-types';
import { logErrorMessage } from './action';
import { logMessage } from "@lib/logger";

describe("logMessageError function", () => {
  test("Fails with an invalid data", async () => {
    const spy = vi.spyOn(logMessage, "error");
    // @ts-expect-error - Testing invalid data
    await logErrorMessage();
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  test("Fails with an invalid code", async () => {
    const spy = vi.spyOn(logMessage, "error");
    await logErrorMessage("NOPE", "1234", 1742927526697);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  test("Fails with a valid code but missing formId", async () => {
    const spy = vi.spyOn(logMessage, "error");
    // @ts-expect-error - Testing invalid data
    await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, undefined, 1742927526697);
    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it("Succees with a valid code and formId", async () => {
    const spy = vi.spyOn(logMessage, "error");
    await logErrorMessage(FormServerErrorCodes.FORM_RESUME_INVALID_DATA, "1234", 1742927526697);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("Client Error: FR08-1742927526697 - formID: 1234");
    spy.mockRestore();
  });

  it("Appends a sanitized detail", async () => {
    const spy = vi.spyOn(logMessage, "error");
    await logErrorMessage(
      FormServerErrorCodes.DOWNLOAD_ZIP_SIZE_LIMIT_REACHED,
      "1234",
      1742927526697,
      "ZIP size limit: 50 MB <script>"
    );
    expect(spy).toHaveBeenCalledWith(
      "Client Error: RS10-1742927526697 - formID: 1234 - ZIP size limit: 50 MB script"
    );
    spy.mockRestore();
  });

  it.each([
    ["line breaks (log injection)", "ok\nClient Error: FAKE", "okClient Error: FAKE"],
    ["non-ASCII and symbols", "Ünï ${x} `y` {z}", "n x y z"],
    ["whitespace only", "   \n  ", ""],
    ["non-string values", { a: 1 } as unknown as string, ""],
  ])("Sanitizes detail with %s", async (_, detail, expected) => {
    const spy = vi.spyOn(logMessage, "error");
    await logErrorMessage(FormServerErrorCodes.DOWNLOAD_ZIP_SIZE_LIMIT_REACHED, "1234", 1, detail);
    const base = "Client Error: RS10-1 - formID: 1234";
    expect(spy).toHaveBeenCalledWith(expected ? `${base} - ${expected}` : base);
    spy.mockRestore();
  });

  it("Truncates detail to 100 characters", async () => {
    const spy = vi.spyOn(logMessage, "error");
    await logErrorMessage(
      FormServerErrorCodes.DOWNLOAD_ZIP_SIZE_LIMIT_REACHED,
      "1234",
      1,
      "a".repeat(500)
    );
    expect(spy).toHaveBeenCalledWith(`Client Error: RS10-1 - formID: 1234 - ${"a".repeat(100)}`);
    spy.mockRestore();
  });

  it("Logs at warn level when requested", async () => {
    const warnSpy = vi.spyOn(logMessage, "warn");
    const errorSpy = vi.spyOn(logMessage, "error");
    await logErrorMessage(
      FormServerErrorCodes.DOWNLOAD_ZIP_SIZE_LIMIT_REACHED,
      "1234",
      1,
      undefined,
      "warn"
    );
    expect(warnSpy).toHaveBeenCalledWith("Client Error: RS10-1 - formID: 1234");
    expect(errorSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("Falls back to error level for unknown levels", async () => {
    const warnSpy = vi.spyOn(logMessage, "warn");
    const errorSpy = vi.spyOn(logMessage, "error");
    await logErrorMessage(
      FormServerErrorCodes.DOWNLOAD_ZIP_SIZE_LIMIT_REACHED,
      "1234",
      1,
      undefined,
      "debug" as never
    );
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
