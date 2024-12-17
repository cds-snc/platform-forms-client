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

import { authorizationPass, authorizationFail } from "__utils__/authorization";
import { AccessControlError } from "@lib/auth";
import { prismaMock } from "@jestUtils";
import { logEvent } from "@lib/auditLogs";

jest.mock("@lib/auditLogs");
jest.mock("@lib/templates");
jest.mock("@lib/privileges");
const mockedLogEvent = jest.mocked(logEvent, { shallow: true });
jest.mock("@lib/integration/zitadelConnector");
const mockedZitadel: jest.MockedFunction<any> = jest.mocked(getZitadelClient, { shallow: true });
const mockedCheckUserHasTemplateOwnership = jest.mocked(checkUserHasTemplateOwnership, {
  shallow: true,
});

const userId = "1";

describe("Service Account functions", () => {
  beforeEach(() => {
    authorizationPass(userId);
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
      authorizationFail(userId);
      await expect(checkMachineUserExists("blah")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      authorizationFail(userId);
      await expect(checkMachineUserExists("blah")).rejects.toThrow(AccessControlError);
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
      expect(result).toBe(keyId);
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
      authorizationFail(userId);
      await expect(checkKeyExists("blah")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      authorizationFail(userId);
      await expect(checkKeyExists("blah")).rejects.toThrow(AccessControlError);
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
        formId: "templateId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "CreateAPIKey",
        "User :1 created API key for service account serviceAccountUser"
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
        formId: "templateId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "CreateAPIKey",
        "User :1 created API key for service account templateId"
      );
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      authorizationFail(userId);
      await expect(createKey("templateId")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      authorizationFail(userId);
      await expect(createKey("templateId")).rejects.toThrow(AccessControlError);
    });
  });
  describe("refreshKey", () => {
    it("should refresh a key", async () => {
      const serviceAccountID = "123412341234";

      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: serviceAccountID } }),
        addMachineKey: jest.fn().mockResolvedValue({ keyId: "keyId" }),
        removeMachineKey: jest.fn().mockResolvedValue({}),
      });
      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: serviceAccountID,
        publicKeyId: "1234",
      });
      const result = await refreshKey("templateId");
      expect(result).toMatchObject({
        keyId: "keyId",
        type: "serviceAccount",
        userId: "123412341234",
        formId: "templateId",
      });
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "RefreshAPIKey",
        "User :1 refreshed API key for service account 123412341234"
      );
    });
    it("should throw if the service account does not exist on the IDP", async () => {
      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: undefined }),
      });

      await expect(refreshKey("templateId")).rejects.toThrow(
        "Service Account User for template templateId does not exist when trying to refresh API Key"
      );
    });
    it("should throw if the service account does not exist in the database", async () => {
      const serviceAccountID = "123412341234";
      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: serviceAccountID } }),
      });
      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);
      await expect(refreshKey("templateId")).rejects.toThrow(
        "No Key Exists in GCForms DB for template templateId"
      );
    });
    it("should throw if the service account id's in the Database and IDP do not match", async () => {
      const serviceAccountID = "123412341234";
      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: serviceAccountID } }),
      });
      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "aDifferentID",
        publicKeyId: "1234",
      });
      await expect(refreshKey("templateId")).rejects.toThrow(
        "Service Account User ID for template templateId is out of sync between GCForms and Zitadel"
      );
    });
    it("should throw if it could not remove the old key", async () => {
      const serviceAccountID = "123412341234";

      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: serviceAccountID } }),
        removeMachineKey: jest.fn().mockRejectedValue(new Error("Zitadel Error Message")),
      });
      (prismaMock.apiServiceAccount.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: serviceAccountID,
        publicKeyId: "1234",
      });
      await expect(refreshKey("templateId")).rejects.toThrow(
        "Failed to delete key in Zitadel for template templateId"
      );
    });
    it("should throw and error is user is not authentiated to perform the action", async () => {
      authorizationFail(userId);
      await expect(refreshKey("templateId")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      authorizationFail(userId);
      await expect(refreshKey("templateId")).rejects.toThrow(AccessControlError);
    });
  });
  describe("deleteKey", () => {
    it("should delete a key if there is an existing user in the IDP", async () => {
      const serviceAccountID = "123412341234";

      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: serviceAccountID } }),
        removeUser: jest.fn().mockResolvedValue({}),
      });
      (prismaMock.apiServiceAccount.deleteMany as jest.MockedFunction<any>).mockResolvedValue({
        count: 1,
      });
      await deleteKey("templateId");

      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "DeleteAPIKey",
        "User :1 deleted service account 123412341234"
      );
    });
    it("should delete a key if there is not an existing user in the IDP", async () => {
      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: undefined }),
        removeUser: jest.fn().mockResolvedValue({}),
      });
      (prismaMock.apiServiceAccount.deleteMany as jest.MockedFunction<any>).mockResolvedValue({
        count: 1,
      });
      await deleteKey("templateId");

      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "DeleteAPIKey",
        "User :1 deleted service account for template templateId"
      );
    });
    it("should not throw an Error if the key does not exist in the database", async () => {
      const serviceAccountID = "123412341234";

      mockedZitadel.mockResolvedValue({
        getUserByLoginNameGlobal: jest.fn().mockResolvedValue({ user: { id: serviceAccountID } }),
        removeUser: jest.fn().mockResolvedValue({}),
      });
      (prismaMock.apiServiceAccount.deleteMany as jest.MockedFunction<any>).mockResolvedValue({
        count: 0,
      });
      await deleteKey("templateId");

      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { type: "ServiceAccount" },
        "DeleteAPIKey",
        "User :1 deleted service account 123412341234"
      );
    });

    it("should throw and error is user is not authentiated to perform the action", async () => {
      authorizationFail(userId);
      await expect(deleteKey("templateId")).rejects.toThrow(AccessControlError);
    });
    it("should throw and error is user is not authorized to perform the action", async () => {
      authorizationFail(userId);
      await expect(deleteKey("templateId")).rejects.toThrow(AccessControlError);
    });
  });
});
