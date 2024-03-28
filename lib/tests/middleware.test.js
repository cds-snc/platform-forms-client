/**
 * @jest-environment node
 */

import { middleware } from "@lib/middleware";
import { NextRequest } from "next/server";

const apiHandler = jest.fn();

describe("Test middleware handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("Sucessfull middleware calls apiHandler", async () => {
    const handler_1 = jest.fn(() => {
      return async () => {
        return { next: true };
      };
    });
    const handler_2 = jest.fn(() => {
      return async () => {
        return { next: true };
      };
    });
    const req = new NextRequest(new Request("http://localhost:3000/api/test"), { method: "GET" });
    await middleware([handler_1(), handler_2()], apiHandler)(req, {});
    expect(apiHandler).toHaveBeenCalledTimes(1);
  });
  it("Failed middleware does not call apiHandler", async () => {
    const handler_1 = jest.fn(() => {
      return async () => {
        return { next: true };
      };
    });
    const handler_2 = jest.fn(() => {
      return async () => {
        return { next: false };
      };
    });
    const req = new NextRequest(new Request("http://localhost:3000/api/test"), { method: "GET" });
    await middleware([handler_1(), handler_2()], apiHandler)(req, {});
    expect(apiHandler).toHaveBeenCalledTimes(0);
  });
  it("Middleware passes props to apiHandler", async () => {
    const handler_1 = jest.fn(() => {
      return async () => {
        return { next: true, props: { user: "test1" } };
      };
    });
    const handler_2 = jest.fn(() => {
      return async () => {
        return { next: true, props: { session: "4" } };
      };
    });
    const req = new NextRequest(new Request("http://localhost:3000/api/test"), { method: "GET" });
    await middleware([handler_1(), handler_2()], apiHandler)(req, {});
    expect(apiHandler).toHaveBeenCalledWith(req, { body: {}, user: "test1", session: "4" });
  });
  it("Middleware is called in order", async () => {
    let orderTest = [];

    const handler_1 = jest.fn(() => {
      return async () => {
        orderTest.push("1");
        return { next: true };
      };
    });
    const handler_2 = jest.fn(() => {
      return async () => {
        orderTest.push("2");
        return { next: true };
      };
    });
    const req = new NextRequest(new Request("http://localhost:3000/api/test"), { method: "GET" });
    await middleware([handler_1(), handler_2()], apiHandler)(req, {});
    expect(orderTest).toEqual(["1", "2"]);
  });
});
