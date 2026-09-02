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

  it("rejects a missing secret without calling hCaptcha", async () => {
    const fetchImpl = vi.fn();

    const result = await verifyHCaptchaToken("token", {
      secret: undefined,
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "missing-secret" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("accepts a successful verification", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
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

  it("accepts a successful response without applying a score policy", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, score: 0.8 }), { status: 200 })
      );

    const result = await verifyHCaptchaToken("token", { secret: "secret", fetchImpl });

    expect(result).toEqual({ verified: true, score: 0.8 });
  });

  it("rejects a suspicious score", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, score: 0.8 }), { status: 200 })
      );
    const logger = { info: vi.fn() };

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      maxAllowedScore: 0.79,
      logger,
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "score-too-high" });
    expect(logger.info).toHaveBeenCalledWith(
      "hCaptcha: verification score 0.8 exceeded limit 0.79"
    );
  });

  it("rejects a configured score policy when the response has no score", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    const logger = { info: vi.fn() };

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      maxAllowedScore: 0.79,
      logger,
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "score-missing" });
    expect(logger.info).toHaveBeenCalledWith("hCaptcha: verification response was missing a score");
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

  it("rejects a malformed verification response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("not-json", { status: 200 }));

    const result = await verifyHCaptchaToken("token", { secret: "secret", fetchImpl });

    expect(result).toEqual({ verified: false, reason: "invalid-response" });
  });

  it("rejects a null verification response", async () => {
    // A syntactically valid JSON response can still have an invalid payload shape
    const fetchImpl = vi.fn().mockResolvedValue(new Response("null", { status: 200 }));

    const result = await verifyHCaptchaToken("token", { secret: "secret", fetchImpl });

    expect(result).toEqual({ verified: false, reason: "invalid-response" });
  });

  it("returns an API error after retries are exhausted", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network failure"));

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      maxAttempts: 1,
      fetchImpl,
    });

    expect(result).toEqual({ verified: false, reason: "api-error" });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("retries a server error", async () => {
    // A score is optional here because no score limit is configured
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await verifyHCaptchaToken("token", {
      secret: "secret",
      maxAttempts: 2,
      fetchImpl,
    });

    expect(result).toEqual({ verified: true, score: undefined });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
