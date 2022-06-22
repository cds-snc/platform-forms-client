import { getCsrfToken } from "next-auth/client";
import logApi from "@pages/api/log";
import { createMocks } from "node-mocks-http";
import { logMessage } from "@lib/logger";
import { Level } from "pino";

jest.mock("next-auth/client");
const mockedGetCsrfToken = jest.mocked(getCsrfToken, true);

describe("Log API Endpoint", () => {
  it.each(["info", "warn", "error"])("Receives and Saves a log for %s level", async (level) => {
    const token = "superSecretToken";
    mockedGetCsrfToken.mockResolvedValue(token);
    const msg = {
      stack:
        "Error: Request failed with status code 403\n    at createError (webpack-internal:///./node_modules/axios/lib/core/createError.js:16:15)\n    at settle (webpack-internal:///./node_modules/axios/lib/core/settle.js:17:12)\n    at XMLHttpRequest.onloadend (webpack-internal:///./node_modules/axios/lib/adapters/xhr.js:66:7)",
      config: {
        transitional: {
          silentJSONParsing: true,
          forcedJSONParsing: true,
          clarifyTimeoutError: false,
        },
        transformRequest: [null],
        transformResponse: [null],
        timeout: 0,
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        maxContentLength: -1,
        maxBodyLength: -1,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "Content-Language": "en",
          "X-CSRF-Token": "cfc3bde20adde711ec4f8f2ab7b9fbff13fc2440d2d0ff2d8c48ceeb544541c0",
        },
        url: "/api/submit",
        method: "post",
      },
      status: 403,
    };
    const headers = {
      type: "application/json",
      "X-CSRF-Token": token,
    };

    const spy = jest.spyOn(logMessage, level as Level);

    const { req, res } = createMocks({
      method: "POST",
      headers,
      url: "/api/log",
      body: { msg, level },
    });

    await logApi(req, res);

    expect(spy).toBeCalledWith(`Client Side log: ${JSON.stringify(msg)}`);
    spy.mockRestore();
  });
  it("Rejects a log if CSRF Token is not provided", async () => {
    const token = "superSecretToken";
    mockedGetCsrfToken.mockResolvedValue(token);
    const msg = {
      stack:
        "Error: Request failed with status code 403\n    at createError (webpack-internal:///./node_modules/axios/lib/core/createError.js:16:15)\n    at settle (webpack-internal:///./node_modules/axios/lib/core/settle.js:17:12)\n    at XMLHttpRequest.onloadend (webpack-internal:///./node_modules/axios/lib/adapters/xhr.js:66:7)",
      config: {
        transitional: {
          silentJSONParsing: true,
          forcedJSONParsing: true,
          clarifyTimeoutError: false,
        },
        transformRequest: [null],
        transformResponse: [null],
        timeout: 0,
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        maxContentLength: -1,
        maxBodyLength: -1,
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "Content-Language": "en",
          "X-CSRF-Token": "cfc3bde20adde711ec4f8f2ab7b9fbff13fc2440d2d0ff2d8c48ceeb544541c0",
        },
        url: "/api/submit",
        method: "post",
      },
      status: 403,
    };
    const level = "info";
    const headers = {
      type: "application/json",
    };

    const spy = jest.spyOn(logMessage, "info");

    const { req, res } = createMocks({
      method: "POST",
      headers,
      url: "/api/log",
      body: { msg, level },
    });

    await logApi(req, res);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
  it("Rejects if wrong CSRF token is provided", async () => {
    const token = "superSecretToken";
    mockedGetCsrfToken.mockResolvedValue(token);
    const msg = [
      {
        stack:
          "Error: Request failed with status code 403\n    at createError (webpack-internal:///./node_modules/axios/lib/core/createError.js:16:15)\n    at settle (webpack-internal:///./node_modules/axios/lib/core/settle.js:17:12)\n    at XMLHttpRequest.onloadend (webpack-internal:///./node_modules/axios/lib/adapters/xhr.js:66:7)",
        config: {
          transitional: {
            silentJSONParsing: true,
            forcedJSONParsing: true,
            clarifyTimeoutError: false,
          },
          transformRequest: [null],
          transformResponse: [null],
          timeout: 0,
          xsrfCookieName: "XSRF-TOKEN",
          xsrfHeaderName: "X-XSRF-TOKEN",
          maxContentLength: -1,
          maxBodyLength: -1,
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "Content-Language": "en",
            "X-CSRF-Token": "cfc3bde20adde711ec4f8f2ab7b9fbff13fc2440d2d0ff2d8c48ceeb544541c0",
          },
          url: "/api/submit",
          method: "post",
        },
        status: 403,
      },
    ];
    const level = "info";
    const headers = {
      type: "application/json",
      "X-CSRF-Token": "wrongToken",
    };

    const spy = jest.spyOn(logMessage, "info");

    const { req, res } = createMocks({
      method: "POST",
      headers,
      url: "/api/log",
      body: { msg, level },
    });

    await logApi(req, res);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
