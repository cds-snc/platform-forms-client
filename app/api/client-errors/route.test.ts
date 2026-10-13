import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ info: vi.fn() }));

vi.mock("@lib/logger", () => ({ logMessage: { info: mocks.info } }));

import { POST } from "./route";

const report = {
  boundary: "route",
  name: "TypeError",
  message: "Request failed for user@example.com",
  stack: "TypeError: Request failed for user@example.com\n    at render (chunk.js:1:2)",
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
  });

  it("logs a sanitized, bounded report and returns no content", async () => {
    const response = await POST(makeRequest(JSON.stringify(report)));

    expect(response.status).toBe(204);
    expect(mocks.info).toHaveBeenCalledOnce();
    const logged = mocks.info.mock.calls[0][0] as string;
    expect(logged).toContain('"boundary":"route"');
    expect(logged).toContain('"formId":"form123"');
    expect(logged).toContain(
      '"stack":"TypeError: Request failed for [Redacted: email]\\n    at render (chunk.js:1:2)"'
    );
    expect(logged).not.toContain("user@example.com");
  });

  it("rejects cross-origin reports", async () => {
    const response = await POST(
      makeRequest(JSON.stringify(report), { origin: "https://attacker.example" })
    );

    expect(response.status).toBe(403);
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

  it("rejects a stack trace above the accepted limit", async () => {
    const response = await POST(
      makeRequest(JSON.stringify({ ...report, stack: "x".repeat(4097) }))
    );

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
