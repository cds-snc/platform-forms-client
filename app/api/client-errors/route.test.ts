import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  info: vi.fn(),
  getAppSetting: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock("@lib/logger", () => ({ logMessage: { info: mocks.info } }));
vi.mock("@lib/appSettings", () => ({ getAppSetting: mocks.getAppSetting }));
vi.mock("@gcforms/database", () => ({
  prisma: { template: { findUnique: mocks.findUnique } },
}));

import { POST } from "./route";

const report = {
  boundary: "route",
  name: "TypeError",
  message: "Request failed for user@example.com",
  online: true,
  connection: "4g",
  msSinceLoad: 1234,
  digest: "digest-123",
  locale: "en",
  formId: "form123",
  step: "confirmation",
};

const makeRequest = (
  body: string,
  options: { origin?: string; ip?: string; contentType?: string } = {}
) => {
  const origin = options.origin ?? "https://forms.example";
  return new Request("https://forms.example/api/client-errors", {
    method: "POST",
    headers: {
      origin,
      "content-type": options.contentType ?? "application/json",
      "x-forwarded-for": `192.0.2.1, ${options.ip ?? "198.51.100.1"}`,
      "user-agent": "Vitest",
    },
    body,
  });
};

describe("client error report route", () => {
  beforeEach(() => {
    mocks.info.mockClear();
    mocks.getAppSetting.mockReset().mockResolvedValue("on");
    mocks.findUnique.mockReset().mockResolvedValue({ id: "form123", ttl: null });
  });

  it("rejects reports for unknown or deleted forms", async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    const unknown = await POST(makeRequest(JSON.stringify(report), { ip: "203.0.113.50" }));
    expect(unknown.status).toBe(400);

    mocks.findUnique.mockResolvedValueOnce({ id: "form123", ttl: new Date() });
    const deleted = await POST(makeRequest(JSON.stringify(report), { ip: "203.0.113.51" }));
    expect(deleted.status).toBe(400);
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it("rejects reports without a formId", async () => {
    const { formId: _formId, ...withoutForm } = report;
    const response = await POST(makeRequest(JSON.stringify(withoutForm), { ip: "203.0.113.52" }));

    expect(response.status).toBe(400);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it("logs a sanitized, bounded report and returns no content", async () => {
    const response = await POST(makeRequest(JSON.stringify(report)));

    expect(response.status).toBe(204);
    expect(mocks.info).toHaveBeenCalledOnce();
    const logged = mocks.info.mock.calls[0][0] as string;
    expect(logged).toContain('"boundary":"route"');
    expect(logged).toContain('"formId":"form123"');
    expect(logged).toContain('"connection":"4g"');
    expect(logged).not.toContain("stack");
    expect(logged).not.toContain("user@example.com");
  });

  it("rejects cross-origin reports", async () => {
    const response = await POST(
      makeRequest(JSON.stringify(report), { origin: "https://attacker.example" })
    );

    expect(response.status).toBe(403);
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it.each(["off", "OFF"])(
    "does not process or log reports when reporting is %s",
    async (disabledSetting) => {
      mocks.getAppSetting.mockResolvedValue(disabledSetting);

      const response = await POST(makeRequest("not-json", { origin: "https://attacker.example" }));

      expect(response.status).toBe(404);
      expect(mocks.info).not.toHaveBeenCalled();
    }
  );

  it("fails closed when the setting cannot be read", async () => {
    mocks.getAppSetting.mockRejectedValue(new Error("Settings unavailable"));

    const response = await POST(makeRequest(JSON.stringify(report)));

    expect(response.status).toBe(503);
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it("rejects malformed reports", async () => {
    const response = await POST(makeRequest(JSON.stringify({ ...report, boundary: "unknown" })));

    expect(response.status).toBe(400);
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it("rejects oversized requests", async () => {
    const response = await POST(
      makeRequest(JSON.stringify({ ...report, message: "x".repeat(9000) }))
    );

    expect(response.status).toBe(413);
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it("rejects invalid context fields", async () => {
    const response = await POST(makeRequest(JSON.stringify({ ...report, online: "yes" })));

    expect(response.status).toBe(400);
    expect(mocks.info).not.toHaveBeenCalled();
  });

  it("limits repeated reports per client", async () => {
    const ip = "203.0.113.40";
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => POST(makeRequest(JSON.stringify(report), { ip })))
    );

    expect(responses.every((response) => response.status === 204)).toBe(true);

    const limitedResponse = await POST(makeRequest(JSON.stringify(report), { ip }));

    expect(limitedResponse.status).toBe(429);
    expect(mocks.info).toHaveBeenCalledTimes(10);
  });
});
