import { generateVerificationCode } from "@lib/auth/2fa";

describe("Test 2FA library", () => {
  it("Should generate a valid and complex verification code", async () => {
    const generatedCode = await generateVerificationCode();

    expect(generatedCode.length).toEqual(5);
    for (const character of generatedCode) {
      expect([..."2346789bdfghjmnpqrtBDFGHJLMNPQRT"].includes(character)).toBeTruthy();
    }
  });
});
