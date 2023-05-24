/**
 * @jest-environment node
 */

import { generateVerificationCode } from "@lib/auth/2fa";
import { containsLowerCaseCharacter } from "@lib/validation";

describe("Test 2FA library", () => {
  it("Should generate a valid and complex verification code", async () => {
    const generatedCode = await generateVerificationCode();

    expect(containsLowerCaseCharacter(generatedCode)).toBe(true);
  });
});
