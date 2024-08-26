/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { checkUserHasTemplateOwnership } from "@lib/templates";
import { getZitadelClient } from "@lib/integration/zitadelConnector";
import {
  checkMachineUserExists,
  checkKeyExists,
  createKey,
  refreshKey,
  deleteKey,
} from "@lib/serviceAccount";
import { Base, mockUserPrivileges } from "__utils__/permissions";
import { AccessControlError, createAbility } from "@lib/privileges";
import { prismaMock } from "@jestUtils";
import { authCheckAndThrow } from "@lib/actions";
import { logEvent } from "@lib/auditLogs";
import type { Session } from "next-auth";

jest.mock("@lib/auditLogs");
jest.mock("@lib/templates");
const mockedLogEvent = jest.mocked(logEvent, { shallow: true });

jest.mock("@lib/integration/zitadelConnector");
jest.mock("@lib/actions/auth");
const mockedAuthCheckAndThrow = jest.mocked(authCheckAndThrow, { shallow: true });
const mockedZitadel: jest.MockedFunction<any> = jest.mocked(getZitadelClient, { shallow: true });
const mockedCheckUserHasTemplateOwnership = jest.mocked(checkUserHasTemplateOwnership, {
  shallow: true,
});

describe("Service Account functions", () => {
  beforeAll(() => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      },
      expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
    } as Session;
    const ability = createAbility(fakeSession);

    mockedAuthCheckAndThrow.mockResolvedValue({ ability, session: fakeSession });
  });
  describe("checkMachineUserExists", () => {
    it("should return user ID if user exists", async () => {
      const userId = "testUser";

      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: userId } }),
      });

      const result = await checkMachineUserExists(userId);

      expect(result).toBe(userId);
    });
    it("should return undefined if user does not exist", async () => {
      const userId = "testUser";

      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: undefined }),
      });

      const result = await checkMachineUserExists(userId);

      expect(result).toBe(undefined);
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockedAuthCheckAndThrow.mockRejectedValue(new AccessControlError());
      expect(checkMachineUserExists("blah")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockedCheckUserHasTemplateOwnership.mockRejectedValue(new AccessControlError());
      expect(checkMachineUserExists("blah")).rejects.toThrow(AccessControlError);
    });
  });
  describe("checkKeyExists", () => {
    it("should return true if key exists", async () => {
      const userId = "testUser";
      const keyId = "test";

      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: userId,
        publicKeyId: keyId,
      });

      mockedZitadel.mockResolvedValue({
        getMachineKeyByIDs: jest.fn().mockResolvedValue({ key: { id: keyId } }),
      });

      const result = await checkKeyExists(userId);
      expect(result).toBe(true);
    });
    it("should return false if key does not exist", async () => {
      const keyId = "test";

      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      mockedZitadel.mockResolvedValue({
        getMachineKeyByIDs: jest.fn().mockResolvedValue({ key: { id: keyId } }),
      });

      const result = await checkKeyExists("testUser");
      expect(result).toBe(false);
    });
    it("should return false if key is out of sync", async () => {
      const userId = "testUser";
      const keyId = "test";

      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: userId,
        publicKeyId: keyId,
      });

      mockedZitadel.mockResolvedValue({
        getMachineKeyByIDs: jest.fn().mockResolvedValue({ key: { id: "differentKey" } }),
      });

      const result = await checkKeyExists(userId);
      expect(result).toBe(false);
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockedAuthCheckAndThrow.mockRejectedValue(new AccessControlError());
      expect(checkKeyExists("blah")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockedCheckUserHasTemplateOwnership.mockRejectedValue(new AccessControlError());
      expect(checkKeyExists("blah")).rejects.toThrow(AccessControlError);
    });
  });
  describe("createKey", () => {
    it("should create a key if no current user exists", async () => {
      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: undefined }),
        addMachineUser: jest.fn().mockResolvedValue({ userId: "serviceAccountUser" }),
        addMachineKey: jest.fn().mockResolvedValue({ keyId: "keyId" }),
      });

      const result = await createKey("templateId");
      expect(result).toMatchObject({
        type: "serviceAccount",
        userId: "serviceAccountUser",
        keyId: "keyId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "CreateAPIKey",
        "User :1 created API key for service account serviceAccountUser "
      );
    });
    it("should create a key if an existing user exists", async () => {
      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: "templateId" } }),
        addMachineKey: jest.fn().mockResolvedValue({ keyId: "keyId" }),
      });

      const result = await createKey("templateId");
      expect(result).toMatchObject({
        type: "serviceAccount",
        userId: "templateId",
        keyId: "keyId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "CreateAPIKey",
        "User :1 created API key for service account templateId "
      );
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      mockedAuthCheckAndThrow.mockRejectedValue(new AccessControlError());
      expect(createKey("templateId")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      mockedCheckUserHasTemplateOwnership.mockRejectedValue(new AccessControlError());
      expect(createKey("templateId")).rejects.toThrow(AccessControlError);
    });
  });
});
