/**
 * @jest-environment node
 */

import { validateTemporaryToken } from "@lib/auth/auth";
import jwt, { Secret } from "jsonwebtoken";
import { prismaMock, PrismaClientKnownRequestError } from "@jestUtils";

describe.skip("validateTemporaryToken", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET_WRONG = "wrong_secret_wrong_secret_wrong_secret_wrong_secret";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET_WRONG;
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("Invalid Token - bad secret", async () => {
    const token = jwt.sign(
      { email: "test@test.ca", formID: "test0form00000id000asdf11" },
      process.env.TOKEN_SECRET_WRONG as Secret,
      {
        expiresIn: "1d",
      }
    );

    const session = await validateTemporaryToken(token);
    expect(session).toEqual(null);
  });
  it("Invalid Token - expired", async () => {
    // Token expires in 1 millisecond
    const token = jwt.sign(
      { email: "test@test.ca", formID: "1test0form00000id000asdf11" },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1",
      }
    );
    // Wait 1 second
    await new Promise((r) => setTimeout(r, 1000));

    const session = await validateTemporaryToken(token);
    expect(session).toEqual(null);
  });
  it("Wrong Token - user Refreshed token", async () => {
    const token = jwt.sign(
      { email: "test@test.ca", formID: "test0form00000id000asdf11" },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1d",
      }
    );
    prismaMock.apiUser.findUnique.mockResolvedValue({
      id: "1",
      templateId: "1",
      email: "test@test.ca",
      active: true,
      temporaryToken: "theRightTokenInTheDatabase",
      created_at: new Date(),
      updated_at: new Date(),
      lastLogin: new Date(),
    });
    const session = await validateTemporaryToken(token);
    expect(session).toEqual(null);
  });
  it("Returns a Form User", async () => {
    const token = jwt.sign(
      { email: "test@test.ca", formID: "test0form00000id000asdf11" },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1d",
      }
    );
    prismaMock.apiUser.findUnique.mockResolvedValue({
      id: "1",
      templateId: "1",
      email: "test@test.ca",
      active: true,
      temporaryToken: token,
      created_at: new Date(),
      updated_at: new Date(),
      lastLogin: new Date(),
    });
    const session = await validateTemporaryToken(token);
    expect(session).toMatchObject({
      id: "1",
      templateId: "1",
      email: "test@test.ca",
      active: true,
      temporaryToken: token,
    });
  });
  it("Returns null is there is a Prisma Error", async () => {
    // Mocking prisma to throw an error
    prismaMock.apiUser.findUnique.mockRejectedValue(
      new PrismaClientKnownRequestError("Can't reach database server", {
        code: "P1001",
        clientVersion: "4.3.2",
      })
    );
    const token = jwt.sign(
      { email: "test@test.ca", formID: "test0form00000id000asdf11" },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1d",
      }
    );
    const session = await validateTemporaryToken(token);
    expect(session).toEqual(null);
  });
});
