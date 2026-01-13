import { describe, test, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { csrfProtected } from "@lib/middleware/csrfProtected";
import { MiddlewareReturn } from "@lib/types";
import { headers } from "next/headers";
import axios from "axios";

vi.mock("next/headers");
vi.mock("axios");

describe("Csrf Protection middleware", () => {
  test("Should pass with unprotected method GET", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "GET" }));
    const data = await csrfProtected()(req, {});
    expect(data).toMatchObject({ next: true });
  });

  test("Should fail with protected method POST and a different csrf token", async () => {
    // Mock axios to return rightCsrfToken
    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 200,
      data: { csrfToken: "rightCsrfToken" },
    });

    // Mock headers to return wrongCsrfToken
    // @ts-expect-error - partial mock implementation
    vi.mocked(headers).mockResolvedValueOnce({
      get: vi.fn().mockReturnValue("wrongCsrfToken"),
    });

    const req = new NextRequest(
      new Request("http://localhost:3000/api/test", {
        method: "POST",
      })
    );

    const data: MiddlewareReturn = await csrfProtected()(req, {});
    expect(data).toMatchObject({ next: false });
    expect(await data.response?.json()).toMatchObject({
      error: "Access Denied",
    });
  });

  test("Should fail with null csrf token", async () => {
    // Mock axios to return rightCsrfToken
    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 200,
      data: { csrfToken: "rightCsrfToken" },
    });

    // Mock headers to return null
    // @ts-expect-error - partial mock implementation
    vi.mocked(headers).mockResolvedValueOnce({
      get: vi.fn().mockReturnValue(null),
    });

    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));

    const data = await csrfProtected()(req, {});

    expect(data).toMatchObject({ next: false });
    expect(await data.response?.json()).toMatchObject({
      error: "Access Denied",
    });
  });

  test("Should allow the request with an accepted method and Csrf Token", async () => {
    // Mock axios to return rightCsrfToken
    vi.mocked(axios.get).mockResolvedValueOnce({
      status: 200,
      data: { csrfToken: "rightCsrfToken" },
    });

    // Mock headers to return rightCsrfToken (same as axios)
    // @ts-expect-error - partial mock implementation
    vi.mocked(headers).mockResolvedValueOnce({
      get: vi.fn().mockReturnValue("rightCsrfToken"),
    });

    const req = new NextRequest(
      new Request("http://localhost:3000/api/test", {
        method: "POST",
      })
    );

    const data = await csrfProtected()(req, {});
    expect(data).toMatchObject({ next: true });
  });
});
