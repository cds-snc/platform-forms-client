/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { csrfProtected } from "@lib/middleware/csrfProtected";
import { MiddlewareReturn } from "@lib/types";
import { headers } from "next/headers";

jest.mock("axios", () => ({
  get: jest.fn().mockResolvedValue({
    status: 200,
    data: { csrfToken: "rightCsrfToken" },
  }),
}));

const mockedHeaders = headers as unknown as jest.MockedFunction<
  () => { get: jest.MockedFunction<() => string | null> }
>;

describe("Csrf Protection middleware", () => {
  test("Should pass with unprotected method GET", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "GET" }));
    const data = await csrfProtected()(req, {});
    expect(data).toMatchObject({ next: true });
  });

  test("Should fail with protected method POST and a different csrf token", async () => {
    const req = new NextRequest(
      new Request("http://localhost:3000/api/test", {
        method: "POST",
      })
    );

    mockedHeaders.mockImplementationOnce(() => {
      return {
        get: jest.fn(() => "wrongCsrfToken"),
      };
    });

    const data: MiddlewareReturn = await csrfProtected()(req, {});
    expect(data).toMatchObject({ next: false });
    expect(await data.response?.json()).toMatchObject({
      error: "Access Denied",
    });
  });

  test("Should fail with null csrf token", async () => {
    const req = new NextRequest(new Request("http://localhost:3000/api/test", { method: "POST" }));
    mockedHeaders.mockImplementationOnce(() => {
      return {
        get: jest.fn(() => null),
      };
    });
    const data = await csrfProtected()(req, {});

    expect(data).toMatchObject({ next: false });
    expect(await data.response?.json()).toMatchObject({
      error: "Access Denied",
    });
  });

  test("Should allow the request with an accepted method and Csrf Token", async () => {
    const req = new NextRequest(
      new Request("http://localhost:3000/api/test", {
        method: "POST",
      })
    );

    mockedHeaders.mockImplementationOnce(() => {
      return {
        get: jest.fn(() => "rightCsrfToken"),
      };
    });

    const data = await csrfProtected()(req, {});
    expect(data).toMatchObject({ next: true });
  });
});
