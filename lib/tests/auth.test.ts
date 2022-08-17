import { isAdmin, validateTemporaryToken } from "@lib/auth";
import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import jwt, { Secret } from "jsonwebtoken";
import { prismaMock } from "@jestUtils";
import { UserRole } from "@prisma/client";

jest.mock("next-auth/next");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getServerSession, true);

describe("Test Auth lib", () => {
  describe("isAdmin", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    afterEach(() => {
      mockGetSession.mockReset();
    });
    it("User is an administrator", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const mockSession = {
        expires: "1",
        user: {
          email: "test@cds.ca",
          name: "test",
          image: "null",
          role: UserRole.ADMINISTRATOR,
          userId: "1",
        },
      };
      mockGetSession.mockResolvedValue(mockSession);
      const userSession = await isAdmin({ req, res });
      expect(userSession).toEqual(mockSession);
    });
    it("User is an administrator", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const mockSession = {
        expires: "1",
        user: {
          email: "test@cds.ca",
          name: "test",
          image: "null",
          role: UserRole.PROGRAM_ADMINISTRATOR,
          userId: "1",
        },
      };
      mockGetSession.mockResolvedValue(mockSession);
      const userSession = await isAdmin({ req, res });
      expect(userSession).toEqual(null);
    });
  });
  describe("validateTemporaryToken", () => {
    beforeAll(() => {
      process.env.TOKEN_SECRET = "some_secret_some_secret_some_secret_some_secret";
      process.env.TOKEN_SECRET_WRONG = "wrong_secret_wrong_secret_wrong_secret_wrong_secret";
    });
    afterAll(() => {
      delete process.env.TOKEN_SECRET;
      delete process.env.TOKEN_SECRET_WRONG;
    });
    beforeEach(() => {
      jest.clearAllMocks();
    });
    it("Invalid Token - bad secret", async () => {
      const token = jwt.sign(
        { email: "test@test.ca", formID: "1" },
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
        { email: "test@test.ca", formID: "1" },
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
        { email: "test@test.ca", formID: "1" },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1d",
        }
      );
      prismaMock.formUser.findUnique.mockResolvedValue({
        id: "1",
        templateId: "1",
        email: "test@test.ca",
        active: true,
        temporaryToken: "theRightTokenInTheDatabase",
        created_at: new Date(),
        updated_at: new Date(),
      });
      const session = await validateTemporaryToken(token);
      expect(session).toEqual(null);
    });
    it("Returns a Form User", async () => {
      const token = jwt.sign(
        { email: "test@test.ca", formID: "1" },
        process.env.TOKEN_SECRET as Secret,
        {
          expiresIn: "1d",
        }
      );
      prismaMock.formUser.findUnique.mockResolvedValue({
        id: "1",
        templateId: "1",
        email: "test@test.ca",
        active: true,
        temporaryToken: token,
        created_at: new Date(),
        updated_at: new Date(),
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
  });
});
