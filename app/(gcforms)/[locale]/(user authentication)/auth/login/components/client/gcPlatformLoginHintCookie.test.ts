import {
  createClearGcPlatformLoginHintCookie,
  createGcPlatformLoginHintCookie,
} from "./gcPlatformLoginHintCookie";

describe("gcPlatformLoginHintCookie", () => {
  it("creates the gc platform hint cookie", () => {
    expect(createGcPlatformLoginHintCookie()).toBe(
      "gc-platform-login=gc-platform; Max-Age=2592000; Path=/; SameSite=Strict"
    );
  });

  it("creates the cookie clearing directive", () => {
    expect(createClearGcPlatformLoginHintCookie()).toBe(
      "gc-platform-login=; Max-Age=0; Path=/; SameSite=Strict"
    );
  });
});
