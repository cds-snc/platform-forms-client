import { createMocks } from "node-mocks-http";
import owners from "../../../../pages/api/id/[form]/owners";
import client from "next-auth/client";

import fetchMock from "jest-fetch-mock";

global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;

jest.mock("next-auth/client");

describe("Test `owners` API.", () => {
  beforeAll(() => {
    const mockSession = {
      expires: "1",
      user: { email: "a@b.com", name: "Testing Forms", image: "null" },
    };
    client.getSession.mockReturnValueOnce(mockSession);
  });

  it("Should add owners to a form", async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ testing: 300 }));
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: JSON.stringify({
        method: "INSERT",
      }),
    });

    await owners(req, res);

    expect(res.statusCode).toBe(200);
  });
});
