import { middleware } from "@lib/middleware";
import { createMocks } from "node-mocks-http";

const apiHandler = jest.fn();

describe("Test middleware handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("Sucessfull middleware calls apiHandler", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });
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
    await middleware([handler_1(), handler_2()], apiHandler)(req, res);
    expect(apiHandler).toBeCalledTimes(1);
  });
  it("Failed middleware does not call apiHandler", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });
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
    await middleware([handler_1(), handler_2()], apiHandler)(req, res);
    expect(apiHandler).toBeCalledTimes(0);
  });
  it("Middleware passes props to apiHandler", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });
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
    await middleware([handler_1(), handler_2()], apiHandler)(req, res);
    expect(apiHandler).toBeCalledWith(req, res, { user: "test1", session: "4" });
  });
  it("Middleware is called in order", async () => {
    let orderTest = [];
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
    });
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
    await middleware([handler_1(), handler_2()], apiHandler)(req, res);
    expect(orderTest).toEqual(["1", "2"]);
  });
});
