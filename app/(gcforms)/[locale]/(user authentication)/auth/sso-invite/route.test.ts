import { GET } from "./route";

describe("SSO invite route", () => {
  it("sets the GC platform login hint and redirects to the localized login page", async () => {
    const response = await GET(new Request("https://example.com/en/auth/sso-invite"), {
      params: Promise.resolve({ locale: "en" }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.com/en/auth/login");
    expect(response.headers.get("set-cookie")).toContain("gc-platform-login=gc-platform");
  });
});
