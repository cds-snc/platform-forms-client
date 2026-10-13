/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { reportClientError } from "./reportClientError";

describe("reportClientError", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("sends the boundary error and only safe public-form route context", () => {
    window.history.replaceState({}, "", "/en/id/form123/confirmation?token=private");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const error = Object.assign(new TypeError("Render failed"), { digest: "digest-123" });
    reportClientError(error, "global");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/client-errors",
      expect.objectContaining({ method: "POST", keepalive: true })
    );
    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(request.body)).toEqual({
      boundary: "global",
      name: "TypeError",
      message: "Render failed",
      digest: "digest-123",
      stack: error.stack.slice(0, 4096),
      locale: "en",
      formId: "form123",
      step: "confirmation",
    });
  });

  it("does not let a failed report request throw into the boundary", () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Offline"));
    vi.stubGlobal("fetch", fetchMock);

    expect(() => reportClientError(new Error("Render failed"), "route")).not.toThrow();
  });

  it("truncates long stack traces before sending them", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const error = new Error("Render failed");
    Object.defineProperty(error, "stack", { value: "frame\n".repeat(1000) });

    reportClientError(error, "route");

    const [, request] = fetchMock.mock.calls[0];
    expect(JSON.parse(request.body).stack).toHaveLength(4096);
  });
});
