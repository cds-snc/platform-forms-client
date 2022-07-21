import { createMocks } from "node-mocks-http";
import { validBearerToken } from "@lib/middleware";
import jwt, { Secret } from "jsonwebtoken";
import { prismaMock } from "@jestUtils";

describe("bearerToken tests", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "some_secret_some_secret_some_secret_some_secret";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it("contains a valid bearer token", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET as Secret, {
      expiresIn: "1y",
    });
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      bearerToken: token,
    });

    await validBearerToken()(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("checks that there is no valid bearer token in the database", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET as Secret, {
      expiresIn: "1y",
    });
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

    await validBearerToken()(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("checks that the authorization header does not contains a valid bearer token", async () => {
    const { req, res } = createMocks({
      method: "POST",
    });

    await validBearerToken()(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("rejects an expired bearer token", async () => {
    const token = jwt.sign({ formID: "1", exp: 1636501665 }, process.env.TOKEN_SECRET as Secret);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });
    await validBearerToken()(req, res);
    expect(res.statusCode).toBe(403);
  });
});
