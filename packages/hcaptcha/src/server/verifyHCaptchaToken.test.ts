import { describe, expect, it, vi } from "vitest";
import { verifyHCaptchaToken } from "./verifyHCaptchaToken";

describe("verifyHCaptchaToken", () => {
  it("rejects a missing token without calling hCaptcha", async () => {
    const fetchImpl = vi.fn();

    const result = await verifyHCaptchaToken(undefined, {
      secret: "secret",
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "missing-token" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("accepts a successful verification", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.2 }), { status: 200 })
    );

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      remoteIp: "127.0.0.1",
      fetchImpl,
    });

    expect(result).toEqual({ verified: true, score: 0.2 });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(String(fetchImpl.mock.calls[0][1]?.body)).toContain("remoteip=127.0.0.1");
  });

  it("rejects a suspicious score", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, score: 0.8 }), { status: 200 })
    );

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "invalid-response" });
  });

  it("does not retry a rejected 4xx response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
        status: 400,
      })
    );

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "invalid-response" });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("retries a server error", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      maxRetries: 1,
      fetchImpl,
    });

    expect(result).toEqual({ verified: true, score: undefined });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
