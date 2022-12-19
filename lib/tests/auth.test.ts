/**
 * @jest-environment node
 */

import { isAuthenticated, validateTemporaryToken, requireAuthentication } from "@lib/auth";
import { Base, getUserPrivileges } from "__utils__/permissions";
import { createMocks } from "node-mocks-http";
import { unstable_getServerSession } from "next-auth/next";
import jwt, { Secret } from "jsonwebtoken";
import { prismaMock } from "@jestUtils";
import { checkPrivileges } from "@lib/privileges";
import { Prisma } from "@prisma/client";

jest.mock("next-auth/next");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, { shallow: true });

describe("Test Auth lib", () => {
  describe("requireAuthentication", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    afterEach(() => {
      mockGetSession.mockReset();
    });
    it("Redirects users without a session to login screen", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // No user session exists
      mockGetSession.mockResolvedValue(null);

      const context = {
        req,
        res,
        query: {},
        resolvedUrl: "",
      };

      const result = await requireAuthentication(async () => ({
        props: {
          test: "1",
        },
      }))(context);
      expect(result).toEqual({
        redirect: {
          destination: `/undefined/auth/login`,
          permanent: false,
        },
      });
    });
    it("Redirects users to acceptable use page when not yet accepted", async () => {
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
          id: "1",
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
          acceptableUse: false,
        },
      };
      mockGetSession.mockResolvedValue(mockSession);

      const context = {
        req,
        res,
        query: {},
        resolvedUrl: "",
      };

      const result = await requireAuthentication(async () => ({
        props: {
          test: "1",
        },
      }))(context);
      expect(result).toEqual({
        redirect: {
          destination: `/undefined/auth/policy?referer=`,
          permanent: false,
        },
      });
    });
    it("Adds user to props when a session is present", async () => {
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
          id: "1",
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };
      mockGetSession.mockResolvedValue(mockSession);

      const context = {
        req,
        res,
        query: {},
        resolvedUrl: "",
      };

      const result = await requireAuthentication(async () => ({ props: {} }))(context);
      expect(result).toEqual({
        props: {
          user: {
            email: "test@cds.ca",
            name: "test",
            image: "null",
            id: "1",
            privileges: getUserPrivileges(Base, { user: { id: "1" } }),
            acceptableUse: true,
          },
        },
      });
    });
    it("Adds user to props when a session is present and keeps innerFunction props", async () => {
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
          id: "1",
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };
      mockGetSession.mockResolvedValue(mockSession);

      const context = {
        req,
        res,
        query: {},
        resolvedUrl: "",
      };

      const result = await requireAuthentication(async () => ({ props: { test: "1" } }))(context);
      expect(result).toEqual({
        props: {
          test: "1",
          user: {
            email: "test@cds.ca",
            name: "test",
            image: "null",
            id: "1",
            privileges: getUserPrivileges(Base, { user: { id: "1" } }),
            acceptableUse: true,
          },
        },
      });
    });
  });
  it("Throws Access Control Error from InnerFunction and redirects", async () => {
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
        id: "1",
        privileges: getUserPrivileges(Base, { user: { id: "1" } }),
        acceptableUse: true,
      },
    };
    mockGetSession.mockResolvedValue(mockSession);

    const context = {
      req,
      res,
      query: {},
      resolvedUrl: "",
    };

    const result = await requireAuthentication(async ({ user: { ability } }) => {
      checkPrivileges(ability, [{ action: "view", subject: "Privilege" }]);
      return {
        props: {},
      };
    })(context);
    expect(result).toEqual({
      redirect: {
        destination: "/undefined/admin/unauthorized",
        permanent: false,
      },
    });
  });
  describe("isAuthenticated", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    afterEach(() => {
      mockGetSession.mockReset();
    });
    it("User has a valid session", async () => {
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
          id: "1",
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
        },
      };
      mockGetSession.mockResolvedValue(mockSession);
      const userSession = await isAuthenticated({ req, res });
      expect(userSession).toEqual(mockSession);
    });
    it("User does not have a valid session", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const mockSession = null;
      mockGetSession.mockResolvedValue(mockSession);
      const userSession = await isAuthenticated({ req, res });
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
        new Prisma.PrismaClientKnownRequestError("Can't reach database server", "P1001", "4.3.2")
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
});
